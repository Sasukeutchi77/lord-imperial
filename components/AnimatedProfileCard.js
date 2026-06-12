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
  {
    id: 'frost',
    name: 'Givre',
    icon: '❄️',
    description: 'Froid glacial',
  },
  {
    id: 'blood',
    name: 'Sang',
    icon: '🩸',
    description: 'Pouvoir sombre',
  },
  {
    id: 'divine',
    name: 'Divin',
    icon: '✨',
    description: 'Lumière sacrée',
  },
  {
    id: 'void',
    name: 'Néant',
    icon: '🕳️',
    description: 'Vide absolu',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    icon: '🌈',
    description: 'Aurores boréales',
  },
  {
    id: 'obsidian',
    name: 'Obsidienne',
    icon: '🖤',
    description: 'Pierre des abysses',
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
  frost: {
    gradientColors: ['#A8EDFF', '#5BC8FB', '#1E90FF', '#A8EDFF'],
    glowColor: 'rgba(91,200,251,0.60)',
    animationType: 'shimmer',
    borderWidth: 3,
    glowSize: 12,
  },
  blood: {
    gradientColors: ['#7F0000', '#CC0000', '#FF3333', '#7F0000'],
    glowColor: 'rgba(180,0,0,0.70)',
    animationType: 'throb',
    borderWidth: 4,
    glowSize: 11,
  },
  divine: {
    gradientColors: ['#FFD700', '#FFF176', '#FFD700', '#C9956B'],
    glowColor: 'rgba(255,215,0,0.70)',
    animationType: 'radiate',
    borderWidth: 3,
    glowSize: 14,
  },
  void: {
    gradientColors: ['#0D0D0D', '#1A0030', '#2D0060', '#0D0D0D'],
    glowColor: 'rgba(80,0,160,0.50)',
    animationType: 'collapse',
    borderWidth: 3,
    glowSize: 10,
  },
  aurora: {
    gradientColors: ['#00FF87', '#60EFFF', '#FF00FF', '#00FF87'],
    glowColor: 'rgba(0,255,135,0.55)',
    animationType: 'rotate',
    borderWidth: 3,
    glowSize: 13,
  },
  obsidian: {
    gradientColors: ['#1A1A2E', '#16213E', '#0F3460', '#533483'],
    glowColor: 'rgba(83,52,131,0.60)',
    animationType: 'breathe',
    borderWidth: 4,
    glowSize: 10,
  },
};

function AnimatedProfileCard({ effect, size = 110, children }) {
  const config = CARD_CONFIGS[effect];
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flickerAnim = useRef(new Animated.Value(1)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const throbAnim = useRef(new Animated.Value(1)).current;
  const radiateAnim = useRef(new Animated.Value(0.6)).current;
  const collapseAnim = useRef(new Animated.Value(1)).current;
  const breatheAnim = useRef(new Animated.Value(0.7)).current;
  const flickerRef = useRef(null);

  useEffect(() => {
    if (!config) return;

    glowAnim.setValue(0.5);
    scaleAnim.setValue(1);
    flickerAnim.setValue(1);
    gradientAnim.setValue(0);
    shimmerAnim.setValue(0);
    throbAnim.setValue(1);
    radiateAnim.setValue(0.6);
    collapseAnim.setValue(1);
    breatheAnim.setValue(0.7);

    const animations = [];

    // Universal glow pulse
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    );
    glowLoop.start();
    animations.push(glowLoop);

    const type = config.animationType;

    if (type === 'pulse') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.97, duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();
      animations.push(loop);
    }

    if (type === 'rotate' || type === 'shimmer') {
      const loop = Animated.loop(
        Animated.timing(gradientAnim, { toValue: 1, duration: 3000, useNativeDriver: false })
      );
      loop.start();
      animations.push(loop);
    }

    if (type === 'shimmer') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(shimmerAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ])
      );
      loop.start();
      animations.push(loop);
    }

    if (type === 'throb') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(throbAnim, { toValue: 1.10, duration: 400, useNativeDriver: true }),
          Animated.timing(throbAnim, { toValue: 0.95, duration: 400, useNativeDriver: true }),
          Animated.timing(throbAnim, { toValue: 1.05, duration: 200, useNativeDriver: true }),
          Animated.timing(throbAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      animations.push(loop);
    }

    if (type === 'radiate') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(radiateAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(radiateAnim, { toValue: 0.55, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      animations.push(loop);
    }

    if (type === 'collapse') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(collapseAnim, { toValue: 0.96, duration: 1200, useNativeDriver: true }),
          Animated.timing(collapseAnim, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
        ])
      );
      loop.start();
      animations.push(loop);
    }

    if (type === 'breathe') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(breatheAnim, { toValue: 0.65, duration: 2000, useNativeDriver: true }),
        ])
      );
      loop.start();
      animations.push(loop);
    }

    if (type === 'flicker') {
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
      animations.forEach((a) => a.stop());
      glowAnim.stopAnimation();
      scaleAnim.stopAnimation();
      flickerAnim.stopAnimation();
      gradientAnim.stopAnimation();
      shimmerAnim.stopAnimation();
      throbAnim.stopAnimation();
      radiateAnim.stopAnimation();
      collapseAnim.stopAnimation();
      breatheAnim.stopAnimation();
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

  const type = config.animationType;
  const isFlicker = type === 'flicker';
  const isPulse = type === 'pulse';
  const isThrob = type === 'throb';
  const isCollapse = type === 'collapse';
  const isDivine = type === 'radiate';
  const isBreathe = type === 'breathe';
  const isShimmer = type === 'shimmer';

  const ringOpacity =
    isFlicker ? flickerAnim :
    isShimmer ? shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) :
    isDivine ? radiateAnim :
    isBreathe ? breatheAnim :
    1;

  const ringScale =
    isPulse ? scaleAnim :
    isThrob ? throbAnim :
    isCollapse ? collapseAnim :
    1;

  const glowOpacity =
    isDivine ? radiateAnim :
    isBreathe ? breatheAnim :
    glowAnim;

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
          opacity: glowOpacity,
          transform: typeof ringScale === 'number' ? [] : [{ scale: ringScale }],
        }}
      />

      {/* Gradient border ring */}
      <Animated.View
        style={{
          position: 'absolute',
          width: outerSize - 4,
          height: outerSize - 4,
          borderRadius: (outerSize - 4) / 2,
          opacity: ringOpacity,
          overflow: 'hidden',
          transform: typeof ringScale === 'number' ? [] : [{ scale: ringScale }],
        }}
      >
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', height: '100%', borderRadius: (outerSize - 4) / 2 }}
        />
      </Animated.View>

      {/* Shimmer overlay for frost card */}
      {isShimmer ? (
        <Animated.View
          style={{
            position: 'absolute',
            width: outerSize - 4,
            height: outerSize - 4,
            borderRadius: (outerSize - 4) / 2,
            backgroundColor: 'rgba(255,255,255,0.18)',
            opacity: shimmerAnim,
          }}
        />
      ) : null}

      {/* Extra glow ring for divine card */}
      {isDivine ? (
        <Animated.View
          style={{
            position: 'absolute',
            width: outerSize + 8,
            height: outerSize + 8,
            borderRadius: (outerSize + 8) / 2,
            borderWidth: 2,
            borderColor: 'rgba(255,215,0,0.35)',
            opacity: radiateAnim,
          }}
        />
      ) : null}

      {/* Dark inner mask */}
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
