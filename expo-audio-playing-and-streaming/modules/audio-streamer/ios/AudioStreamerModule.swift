import ExpoModulesCore
import AVFoundation
import Foundation

public class AudioStreamerModule: Module {
  private var audioEngine: AVAudioEngine?
  private var inputNode: AVAudioInputNode?
  private var isRecording = false
  private var sampleRate: Double = 44100
  private var intervalMs: Int = 100
  private var audioBuffer: [Int16] = []
  private var samplesPerInterval: Int = 0
  private var timer: Timer?
  
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('AudioStreamer')` in JavaScript.
    Name("AudioStreamer")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants([
      "PI": Double.pi
    ])

    // Defines event names that the module can send to JavaScript.
    Events("onChange", "onAudioStreamData", "onAudioStreamStatus")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    AsyncFunction("startAudioStream") { (config: [String: Any], promise: Promise) in
      do {
        try self.startAudioStream(config: config)
        promise.resolve(nil)
      } catch {
        promise.reject("START_FAILED", "Failed to start audio streaming: \(error.localizedDescription)")
      }
    }

    AsyncFunction("stopAudioStream") { (promise: Promise) in
      do {
        try self.stopAudioStream()
        promise.resolve(nil)
      } catch {
        promise.reject("STOP_FAILED", "Failed to stop audio streaming: \(error.localizedDescription)")
      }
    }

    AsyncFunction("isAudioStreaming") { (promise: Promise) in
      promise.resolve(self.isRecording)
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(AudioStreamerView.self) {
      // Defines a setter for the `url` prop.
      Prop("url") { (view: AudioStreamerView, url: URL) in
        if view.webView.url != url {
          view.webView.load(URLRequest(url: url))
        }
      }

      Events("onLoad")
    }
  }
  
  private func startAudioStream(config: [String: Any]) throws {
    if isRecording {
      throw AudioStreamerError.alreadyRecording
    }
    
    // Check microphone permission
    let audioSession = AVAudioSession.sharedInstance()
    guard audioSession.recordPermission == .granted else {
      throw AudioStreamerError.permissionDenied
    }
    
    // Extract config values
    if let sr = config["sampleRate"] as? Double {
      sampleRate = sr
    }
    if let interval = config["interval"] as? Double {
      intervalMs = Int(interval)
    }
    
    samplesPerInterval = Int((sampleRate * Double(intervalMs)) / 1000.0)
    
    // Configure audio session
    try audioSession.setCategory(.record, mode: .measurement, options: [])
    try audioSession.setActive(true)
    
    // Setup audio engine
    audioEngine = AVAudioEngine()
    inputNode = audioEngine?.inputNode
    
    guard let audioEngine = audioEngine, let inputNode = inputNode else {
      throw AudioStreamerError.initializationFailed
    }
    
    // Configure input format
    let inputFormat = inputNode.outputFormat(forBus: 0)
    let recordingFormat = AVAudioFormat(
      commonFormat: .pcmFormatInt16,
      sampleRate: sampleRate,
      channels: 1,
      interleaved: false
    )
    
    guard let recordingFormat = recordingFormat else {
      throw AudioStreamerError.invalidFormat
    }
    
    // Install tap on input node
    inputNode.installTap(onBus: 0, bufferSize: 1024, format: inputFormat) { [weak self] (buffer, time) in
      self?.processAudioBuffer(buffer, format: recordingFormat)
    }
    
    // Start audio engine
    try audioEngine.start()
    isRecording = true
    
    // Send status event
    sendEvent("onAudioStreamStatus", ["isStreaming": true])
    
    // Reset audio buffer
    audioBuffer.removeAll()
  }
  
  private func stopAudioStream() throws {
    if !isRecording {
      return
    }
    
    isRecording = false
    timer?.invalidate()
    timer = nil
    
    inputNode?.removeTap(onBus: 0)
    audioEngine?.stop()
    audioEngine = nil
    inputNode = nil
    
    let audioSession = AVAudioSession.sharedInstance()
    try audioSession.setActive(false)
    
    // Send status event
    sendEvent("onAudioStreamStatus", ["isStreaming": false])
    
    // Clear audio buffer
    audioBuffer.removeAll()
  }
  
  private func processAudioBuffer(_ buffer: AVAudioPCMBuffer, format: AVAudioFormat) {
    guard let channelData = buffer.int16ChannelData else { return }
    
    let channelDataPointer = channelData[0]
    let frameLength = Int(buffer.frameLength)
    
    for i in 0..<frameLength {
      let sample = channelDataPointer[i]
      audioBuffer.append(sample)
      
      // When we have enough samples for one interval, send them
      if audioBuffer.count >= samplesPerInterval {
        let audioData = Array(audioBuffer.prefix(samplesPerInterval)).map { Int($0) }
        
        DispatchQueue.main.async { [weak self] in
          self?.sendEvent("onAudioStreamData", ["data": audioData])
        }
        
        // Remove processed samples
        audioBuffer.removeFirst(samplesPerInterval)
      }
    }
  }
}

enum AudioStreamerError: Error, LocalizedError {
  case alreadyRecording
  case permissionDenied
  case initializationFailed
  case invalidFormat
  
  var errorDescription: String? {
    switch self {
    case .alreadyRecording:
      return "Audio streaming is already active"
    case .permissionDenied:
      return "Audio recording permission not granted"
    case .initializationFailed:
      return "Failed to initialize audio engine"
    case .invalidFormat:
      return "Invalid audio format configuration"
    }
  }
}
