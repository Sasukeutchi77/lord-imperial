import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appTheme } from '../utils/theme';
import { logger } from '../services/logger';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logger.error('Erreur UI non récupérée.', {
      message: error?.message,
      stack: error?.stack,
      componentStack: info?.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Oups, l’écran a planté.</Text>
        <Text style={styles.subtitle}>L’erreur a été journalisée. Vous pouvez relancer l’interface sans fermer l’application.</Text>
        <Pressable style={styles.button} onPress={this.handleReset}>
          <Text style={styles.buttonText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: appTheme.colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: appTheme.colors.textMuted,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 24,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
  },
});
