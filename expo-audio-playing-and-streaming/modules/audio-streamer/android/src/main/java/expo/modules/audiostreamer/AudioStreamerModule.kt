package expo.modules.audiostreamer

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import android.media.AudioRecord
import android.media.MediaRecorder
import android.media.AudioFormat
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import java.net.URL

class AudioStreamerModule : Module() {
  private var audioRecord: AudioRecord? = null
  private var isRecording = false
  private var recordingJob: Job? = null
  private val scope = CoroutineScope(Dispatchers.IO)
  
  private var sampleRate = 44100
  private var intervalMs = 100
  private var bufferSizeInBytes = 0

  override fun definition() = ModuleDefinition {
    Name("AudioStreamer")

    Constants(
      "PI" to Math.PI
    )

    Events("onChange", "onAudioStreamData", "onAudioStreamStatus")

    Function("hello") {
      "Hello world! 👋"
    }

    AsyncFunction("setValueAsync") { value: String ->
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    AsyncFunction("startAudioStream") { config: Map<String, Any>, promise: Promise ->
      try {
        if (isRecording) {
          promise.reject(CodedException("ALREADY_RECORDING", "Audio streaming is already active", null))
          return@AsyncFunction
        }

        // Check for audio permission
        if (ContextCompat.checkSelfPermission(
            appContext.reactContext!!,
            Manifest.permission.RECORD_AUDIO
          ) != PackageManager.PERMISSION_GRANTED
        ) {
          promise.reject(CodedException("PERMISSION_DENIED", "Audio recording permission not granted", null))
          return@AsyncFunction
        }

        // Extract config values
        sampleRate = (config["sampleRate"] as? Double)?.toInt() ?: 44100
        intervalMs = (config["interval"] as? Double)?.toInt() ?: 100

        // Calculate buffer size
        val channelConfig = AudioFormat.CHANNEL_IN_MONO
        val audioFormat = AudioFormat.ENCODING_PCM_16BIT
        bufferSizeInBytes = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)
        
        if (bufferSizeInBytes == AudioRecord.ERROR_BAD_VALUE || bufferSizeInBytes == AudioRecord.ERROR) {
          promise.reject(CodedException("INVALID_CONFIG", "Invalid audio configuration", null))
          return@AsyncFunction
        }

        // Create AudioRecord instance
        audioRecord = AudioRecord(
          MediaRecorder.AudioSource.MIC,
          sampleRate,
          channelConfig,
          audioFormat,
          bufferSizeInBytes * 2  // Double the minimum buffer size for safety
        )

        if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
          promise.reject(CodedException("INITIALIZATION_FAILED", "Failed to initialize AudioRecord", null))
          return@AsyncFunction
        }

        // Start recording
        audioRecord?.startRecording()
        isRecording = true

        // Send status event
        sendEvent("onAudioStreamStatus", mapOf("isStreaming" to true))

        // Start background recording job
        startRecordingJob()
        
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(CodedException("START_FAILED", "Failed to start audio streaming: ${e.message}", e))
      }
    }

    AsyncFunction("stopAudioStream") { promise: Promise ->
      try {
        if (!isRecording) {
          promise.resolve(null)
          return@AsyncFunction
        }

        isRecording = false
        recordingJob?.cancel()
        recordingJob = null

        audioRecord?.stop()
        audioRecord?.release()
        audioRecord = null

        // Send status event
        sendEvent("onAudioStreamStatus", mapOf("isStreaming" to false))
        
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject(CodedException("STOP_FAILED", "Failed to stop audio streaming: ${e.message}", e))
      }
    }

    AsyncFunction("isAudioStreaming") { promise: Promise ->
      promise.resolve(isRecording)
    }

    View(AudioStreamerView::class) {
      Prop("url") { view: AudioStreamerView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      Events("onLoad")
    }
  }

  private fun startRecordingJob() {
    recordingJob = scope.launch {
      val buffer = ShortArray(bufferSizeInBytes / 2) // 16-bit samples
      val samplesPerInterval = (sampleRate * intervalMs) / 1000
      val intervalBuffer = ShortArray(samplesPerInterval)
      var bufferPosition = 0

      while (isActive && isRecording) {
        try {
          val bytesRead = audioRecord?.read(buffer, 0, buffer.size) ?: 0
          
          if (bytesRead > 0) {
            // Process the audio data in intervals
            for (i in 0 until bytesRead) {
              if (bufferPosition < intervalBuffer.size) {
                intervalBuffer[bufferPosition] = buffer[i]
                bufferPosition++
              }

              // When we have enough samples for one interval, send them
              if (bufferPosition >= intervalBuffer.size) {
                val audioData = intervalBuffer.map { it.toInt() }
                
                // Send audio data event on main thread
                launch(Dispatchers.Main) {
                  sendEvent("onAudioStreamData", mapOf("data" to audioData))
                }
                
                bufferPosition = 0
              }
            }
          }
          
          // Small delay to prevent excessive CPU usage
          delay(10)
        } catch (e: Exception) {
          // Handle any recording errors
          launch(Dispatchers.Main) {
            sendEvent("onAudioStreamStatus", mapOf("isStreaming" to false))
          }
          isRecording = false
          break
        }
      }
    }
  }
}
