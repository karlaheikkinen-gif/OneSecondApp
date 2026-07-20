import { useRouter } from 'expo-router';
import { CameraType, CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { File } from 'expo-file-system';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { saveClip } from '../../lib/clipStore';

export default function RecordScreen() {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const player = useVideoPlayer(previewUri ?? null, (p) => {
    p.loop = true;
    if (previewUri) p.play();
  });

  const handleRecord = useCallback(async () => {
    if (!cameraRef.current || isRecording) return;
    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 1 });
      if (video?.uri) {
        setPreviewUri(video.uri);
      }
    } catch (error) {
      Alert.alert('Recording failed', String(error));
    } finally {
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleDiscard = useCallback(() => {
    if (previewUri) {
      try {
        const file = new File(previewUri);
        if (file.exists) file.delete();
      } catch {
        // ignore
      }
    }
    setPreviewUri(null);
  }, [previewUri]);

  const handleKeep = useCallback(async () => {
    if (!previewUri) return;
    setIsSaving(true);
    try {
      await saveClip(previewUri);
      setPreviewUri(null);
      router.push('/clips');
    } catch (error) {
      Alert.alert('Could not save clip', String(error));
    } finally {
      setIsSaving(false);
    }
  }, [previewUri, router]);

  if (!cameraPermission || !micPermission) {
    return <View style={styles.container} />;
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>
          OneSecondApp needs camera and microphone access to record your daily clip.
        </Text>
        <Pressable
          style={styles.button}
          onPress={async () => {
            await requestCameraPermission();
            await requestMicPermission();
          }}
        >
          <Text style={styles.buttonText}>Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  if (previewUri) {
    return (
      <View style={styles.container}>
        <VideoView style={styles.camera} player={player} contentFit="cover" nativeControls={false} />
        <View style={styles.previewControls}>
          <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleDiscard} disabled={isSaving}>
            <Text style={styles.buttonText}>Retake</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleKeep} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Keep this one</Text>}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} mode="video" />
      <View style={styles.controls}>
        <Pressable
          style={styles.flipButton}
          onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
        >
          <Text style={styles.flipButtonText}>Flip</Text>
        </Pressable>
        <Pressable
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={handleRecord}
          disabled={isRecording}
        >
          {isRecording ? <ActivityIndicator color="#fff" /> : <View style={styles.recordButtonInner} />}
        </Pressable>
        <View style={styles.flipButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 32,
  },
  previewControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 32,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    borderColor: '#e33',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e33',
  },
  flipButton: {
    width: 60,
    alignItems: 'center',
  },
  flipButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
