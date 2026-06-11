import React, { memo } from 'react';
import { Image, Text, View } from 'react-native';
import { getCustomEmojiSource, parseMessageWithCustomEmojis } from '../utils/customEmojis';

// Renders a single custom emoji as an inline image
export const CustomEmojiImage = memo(function CustomEmojiImage({ id, size = 20 }) {
  const source = getCustomEmojiSource(id);
  if (!source) return <Text>{`:${id}:`}</Text>;
  return (
    <Image
      source={source}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
});

// Renders a message text that may contain :li_xxx: codes as mixed text + emoji images
export const CustomEmojiText = memo(function CustomEmojiText({
  text = '',
  textStyle,
  emojiSize = 20,
}) {
  const segments = parseMessageWithCustomEmojis(text);

  // If no custom emojis, render plain text
  if (segments.every((s) => s.type === 'text')) {
    return <Text style={textStyle}>{text}</Text>;
  }

  return (
    <Text style={textStyle}>
      {segments.map((seg, i) => {
        if (seg.type === 'emoji') {
          return (
            <View
              key={i}
              style={{
                display: 'inline-flex',
                width: emojiSize,
                height: emojiSize,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CustomEmojiImage id={seg.id} size={emojiSize} />
            </View>
          );
        }
        return seg.value;
      })}
    </Text>
  );
});

export default CustomEmojiText;
