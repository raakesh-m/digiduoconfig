import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface Props {
  visible: boolean;
  isWon: boolean;
  level: number;
  onRestart: () => void;
  onNextLevel?: () => void;
  onMainMenu?: () => void;
}

export const GameOverlay: React.FC<Props> = ({
  visible,
  isWon,
  level,
  onRestart,
  onNextLevel,
  onMainMenu
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            {isWon ? '🎉 Level Complete!' : '⏰ Time\'s Up!'}
          </Text>

          <Text style={styles.subtitle}>
            {isWon
              ? `Great job on Level ${level}!`
              : `Better luck next time!`
            }
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.restartButton]}
              onPress={onRestart}
            >
              <Text style={styles.buttonText}>
                {isWon ? 'Play Again' : 'Retry'}
              </Text>
            </TouchableOpacity>

            {isWon && onNextLevel && (
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={onNextLevel}
              >
                <Text style={styles.buttonText}>Next Level</Text>
              </TouchableOpacity>
            )}

            {onMainMenu && (
              <TouchableOpacity
                style={[styles.button, styles.menuButton]}
                onPress={onMainMenu}
              >
                <Text style={styles.buttonText}>Main Menu</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    minWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#94A3B8',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  restartButton: {
    backgroundColor: 'rgba(96, 165, 250, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  nextButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  menuButton: {
    backgroundColor: 'rgba(71, 85, 105, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});