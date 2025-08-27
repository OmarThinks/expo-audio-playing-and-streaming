import ExpoModulesCore
import AVFoundation

public class AudioPlayerModule: Module {
  private var audioPlayer: AVAudioPlayer?
  private var isPlaying = false

  public func definition() -> ModuleDefinition {
    Name("AudioPlayer")

    Constants([
      "PI": Double.pi
    ])

    Events("onAudioStartsPlaying", "onAudioStopsPlaying")

    Function("hello") {
      return "Hello world! 👋"
    }

    AsyncFunction("setValueAsync") { (value: String) in
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    AsyncFunction("playAudio") { (base64Text: String, sampleRate: Int, promise: Promise) in
      do {
        
        // Stop any current playback
        self.stopCurrentPlayback()
        
        // Decode base64 audio data
        guard let audioData = Data(base64Encoded: base64Text) else {
          promise.reject("DECODE_ERROR", "Failed to decode base64 audio data")
          return
        }
        
        // Configure audio session
        try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
        try AVAudioSession.sharedInstance().setActive(true)
        
        // Create audio player
        self.audioPlayer = try AVAudioPlayer(data: audioData)
        self.audioPlayer?.delegate = self
        
        guard let player = self.audioPlayer else {
          promise.reject("PLAYER_ERROR", "Failed to create audio player")
          return
        }
        
        // Start playback
        if player.play() {
          self.isPlaying = true
          self.sendEvent("onAudioStartsPlaying", [:])
          promise.resolve(nil)
        } else {
          promise.reject("PLAYBACK_ERROR", "Failed to start audio playback")
        }
      } catch {
        promise.reject("PLAY_AUDIO_ERROR", error.localizedDescription)
      }
    }

    AsyncFunction("stopPlayingAudio") { (promise: Promise) in
      self.stopCurrentPlayback()
      promise.resolve(nil)
    }

    AsyncFunction("isAudioPlaying") { (promise: Promise) in
      promise.resolve(self.isPlaying)
    }

    View(AudioPlayerView.self) {
      Prop("url") { (view: AudioPlayerView, url: URL) in
        if view.webView.url != url {
          view.webView.load(URLRequest(url: url))
        }
      }

      Events("onLoad")
    }
  }
  
  private func stopCurrentPlayback() {
    audioPlayer?.stop()
    audioPlayer = nil
    
    if isPlaying {
      isPlaying = false
      sendEvent("onAudioStopsPlaying", [:])
    }
  }
}

extension AudioPlayerModule: AVAudioPlayerDelegate {
  public func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
    stopCurrentPlayback()
  }
  
  public func audioPlayerDecodeErrorDidOccur(_ player: AVAudioPlayer, error: Error?) {
    stopCurrentPlayback()
  }
}
