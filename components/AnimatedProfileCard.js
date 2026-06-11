import React, { useEffect, useRef, memo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const PROFILE_CARDS = [
  {
    id: 'fire',
    name: 'Feu',
    icon: '🔥',
    description: 'Flammes ardentes',
  },
  {
    id: 'neon',
    name: 'Néon',
    icon: '⚡',
    description: 'Lueur électrique',
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    icon: '🌌',
    description: 'Cosmos infini',
  },
  {
    id: 'demonic',
    name: 'Démoniaque',
    icon: '😈',
    description: 'Ténèbres infernales',
  },
];

const CARD_CONFIGS = {
  fire: {
    gradientColors: ['#FF4500', '#FF6B00', '#FF8C00', '#FF2400'],
    glowColor: 'rgba(255,100,0,0.55)',
    animationType: 'pulse',
    borderWidth: 3,
    glowSize: 10,
  },
  neon: {
    gradientColors: ['#00FFFF', '#BF00FF', '#FF00FF', '#00FFFF'],
    glowColor: 'rgba(0,255,255,0.65)',
    animationType: 'rotate',
    borderWidth: 3,
    glowSize: 12,
  },
  galaxy: {
    gradientColors: ['#7B2FBE', '#4A1DFF', '#1E90FF', '#7B2FBE'],
    glowColor: 'rgba(123,47,190,0.55)',
    animationType: 'rotate',
    borderWidth: 3,
    glowSize: 10,
  },
  demonic: {
    gradientColors: ['#CC0000', '#8B0000', '#FF1A1A', '#8B0000'],
    glowColor: 'rgba(200,0,0,0.65)',
    animationType: 'flicker',
    borderWidth: 3,
    glowSize: 10,
  },
};

function AnimatedProfileCard({ effect, size = 110, children }) {
  const config = CARD_CONFIGS[effect];
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flickerAnim = useRef(new Animated.Value(1)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;
  const flickerRef = useRef(null);

  useEffect(() => {
    if (!config) return;

    // Glow pulse — all effects
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    if (config.animationType === 'pulse') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.97, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }

    if (config.animationType === 'rotate') {
      Animated.loop(
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        })
      ).start();
    }

    if (config.animationType === 'flicker') {
      const doFlicker = () => {
        flickerRef.current = Animated.sequence([
          Animated.timing(flickerAnim, { toValue: 0.65, duration: 70, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 1, duration: 55, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 0.82, duration: 110, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 1, duration: 90, useNativeDriver: true }),
          Animated.delay(1000 + Math.random() * 1200),
        ]);
        flickerRef.current.start(({ finished }) => {
          if (finished) doFlicker();
        });
      };
      doFlicker();
    }

    return () => {
      glowAnim.stopAnimation();
      scaleAnim.stopAnimation();
      gradientAnim.stopAnimation();
      flickerAnim.stopAnimation();
      flickerRef.current?.stop?.();
    };
  }, [effect]);

  if (!config) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
        {children}
      </View>
    );
  }

  const padding = config.borderWidth + config.glowSize;
  const outerSize = size + padding * 2;
  const outerRadius = outerSize / 2;
  const innerMaskSize = outerSize - config.borderWidth * 2 - 4;
  const innerMaskRadius = innerMaskSize / 2;

  const isFlicker = config.animationType === 'flicker';
  const isPulse = config.animationType === 'pulse';

  const gradientStart = gradientAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <View style={{ width: outerSize, height: outerSize, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer glow */}
      <Animated.View
        style={{
          position: 'absolute',
          width: outerSize,
          height: outerSize,
          borderRadius: outerRadius,
          backgroundColor: config.glowColor,
          opacity: glowAnim,
          transform: isPulse ? [{ scale: scaleAnim }] : [],
        }}
      />

      {/* Gradient border ring */}
      <Animated.View
        style={{
          position: 'absolute',
          width: outerSize - 4,
          height: outerSize - 4,
          borderRadius: (outerSize - 4) / 2,
          opacity: isFlicker ? flickerAnim : 1,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', height: '100%', borderRadius: (outerSize - 4) / 2 }}
        />
      </Animated.View>

      {/* Dark inner mask — hides gradient in the center */}
      <View
        style={{
          position: 'absolute',
          width: innerMaskSize,
          height: innerMaskSize,
          borderRadius: innerMaskRadius,
          backgroundColor: '#0D1117',
        }}
      />

      {/* Avatar */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}

export default memo(AnimatedProfileCard);
