import React from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface ScoreData {
  score: number;
  streak: number;
  pairsFound: number;
  addRowsRemaining: number;
}

interface ScoreManagerProps {
  scoreData: ScoreData;
  scorePopAnim?: Animated.Value;
  statCardPulseAnim?: Animated.Value;
  compact?: boolean;
  customLabels?: {
    score?: string;
    streak?: string;
    pairs?: string;
    rows?: string;
  };
  colors?: {
    score?: string;
    streak?: string;
    pairs?: string;
    rows?: string;
  };
}

export const ScoreManager: React.FC<ScoreManagerProps> = ({
  scoreData,
  scorePopAnim,
  statCardPulseAnim,
  compact = false,
  customLabels = {},
  colors = {}
}) => {
  const {
    score = 'Score',
    streak = 'Streak',
    pairs = 'Pairs',
    rows = 'Rows'
  } = customLabels;

  const {
    score: scoreColor = '#00FFB3',
    streak: streakColor = '#FFD600',
    pairs: pairsColor = '#FF007A',
    rows: rowsColor = '#8C1BFF'
  } = colors;

  const getAnimatedStyle = () => {
    if (statCardPulseAnim) {
      return { transform: [{ scale: statCardPulseAnim }] };
    }
    return {};
  };

  const getScoreAnimatedStyle = () => {
    if (scorePopAnim) {
      return { transform: [{ scale: scorePopAnim }] };
    }
    return {};
  };

  return (
    <View style={compact ? styles.compactStatsRow : styles.statsRow}>
      <Animated.View style={[compact ? styles.compactStatCard : styles.statCard, getAnimatedStyle()]}>
        <Text style={compact ? styles.compactStatLabel : styles.statLabel}>{score}</Text>
        <Animated.Text
          style={[
            compact ? styles.compactStatValue : styles.statValue,
            getScoreAnimatedStyle(),
            { color: scoreColor }
          ]}
        >
          {scoreData.score.toLocaleString()}
        </Animated.Text>
      </Animated.View>

      <Animated.View style={[compact ? styles.compactStatCard : styles.statCard, getAnimatedStyle()]}>
        <Text style={compact ? styles.compactStatLabel : styles.statLabel}>{streak}</Text>
        <Animated.View
          style={[
            compact ? styles.compactStreakContainer : styles.streakContainer,
            {
              boxShadow: '0px 0px 6px rgba(255, 214, 0, 0.5)',
            }
          ]}
        >
          <Text style={[
            compact ? styles.compactStatValue : styles.statValue,
            { color: scoreData.streak > 1 ? streakColor : '#8B8B9B' }
          ]}>
            {scoreData.streak}x
          </Text>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[compact ? styles.compactStatCard : styles.statCard, getAnimatedStyle()]}>
        <Text style={compact ? styles.compactStatLabel : styles.statLabel}>{pairs}</Text>
        <Text style={[compact ? styles.compactStatValue : styles.statValue, { color: pairsColor }]}>
          {scoreData.pairsFound}
        </Text>
      </Animated.View>

      <Animated.View style={[compact ? styles.compactStatCard : styles.statCard, getAnimatedStyle()]}>
        <Text style={compact ? styles.compactStatLabel : styles.statLabel}>{rows}</Text>
        <Text style={[compact ? styles.compactStatValue : styles.statValue, { color: rowsColor }]}>
          {scoreData.addRowsRemaining}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: screenWidth * 0.18,
    boxShadow: '0px 4px 8px rgba(0, 255, 179, 0.06)',
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  statLabel: {
    fontSize: screenWidth * 0.026,
    color: '#CBD5E1',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: screenWidth * 0.042,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  streakContainer: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  compactStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactStatCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: screenWidth * 0.14,
    boxShadow: '0px 1px 3px rgba(0, 255, 179, 0.03)',
    elevation: 3,
  },
  compactStatLabel: {
    fontSize: screenWidth * 0.02,
    color: '#CBD5E1',
    fontWeight: '600',
    marginBottom: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  compactStatValue: {
    fontSize: screenWidth * 0.032,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  compactStreakContainer: {
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
});