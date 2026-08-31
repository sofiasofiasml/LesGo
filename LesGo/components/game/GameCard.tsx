import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface GameCardProps {
    card: any;
    formattedText: string;
    isCustom: boolean;
    colors: any;
    onTimerStart: () => void;
}

export default function GameCard({ card, formattedText, isCustom, colors, onTimerStart }: GameCardProps) {
    const { width, height } = useWindowDimensions();
    const isCompactScreen = height < 760;
    const textLength = formattedText?.length ?? 0;

    // Keep room for the header and action buttons while maximizing card height.
    const reservedVerticalSpace = isCompactScreen ? 250 : 280;
    const cardMaxHeight = Math.max(360, Math.min(680, height - reservedVerticalSpace));
    const cardMinHeight = Math.max(240, Math.min(320, height * 0.35));

    const baseTextSize = Math.max(20, Math.min(32, width * 0.072));
    const roomScale = cardMaxHeight > 600 ? 1.22
        : cardMaxHeight > 520 ? 1.14
            : cardMaxHeight > 450 ? 1.08
                : 1;
    const textScale = textLength > 360 ? 0.5
        : textLength > 300 ? 0.56
            : textLength > 240 ? 0.64
                : textLength > 180 ? 0.72
                    : textLength > 130 ? 0.82
                        : 1;
    const cardTextSize = Math.max(13, Math.min(38, Math.round(baseTextSize * textScale * roomScale)));
    const cardTextLineHeight = cardTextSize * 1.24;
    const maxTextLines = Math.max(14, Math.min(28, Math.floor((cardMaxHeight - 150) / cardTextLineHeight)));

    const iconSize = textLength > 220 ? 34 : (cardMaxHeight > 520 ? 44 : 40);
    const iconPadding = textLength > 220 ? 14 : 20;

    // Shared value for the rotation (flip animation)
    const rotation = useSharedValue(0);
    // Shared value for scale (pop effect)
    const scale = useSharedValue(0.9);

    // Trigger animation when content (card) changes
    useEffect(() => {
        // Reset and Animate
        rotation.value = 0;
        scale.value = 0.9;

        // Sequence: Flip + Scale Pop
        rotation.value = withSpring(360, { damping: 12, stiffness: 90 });
        scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.exp) });
    }, [card.id]); // Dependency on card ID to trigger only on new card

    // Animated Styles
    const animatedStyle = useAnimatedStyle(() => {
        const rotateY = `${rotation.value}deg`;

        return {
            transform: [
                { rotateY: rotateY },
                { scale: scale.value }
            ],
            // Backface visibility is tricky on Android sometimes, but usually fine
            backfaceVisibility: 'hidden',
        };
    });

    const renderIcon = () => {
        switch (card.type) {
            case 'question': return <FontAwesome name="question-circle" size={iconSize} color={colors.lightOrange} />;
            case 'challenge': return <FontAwesome name="bolt" size={iconSize} color={colors.pink} />;
            case 'rule': return <FontAwesome name="gavel" size={iconSize} color="#9b59b6" />;
            case 'viral': return <FontAwesome name="hashtag" size={iconSize} color="#2ecc71" />;
            default: return <FontAwesome name="gamepad" size={iconSize} color={colors.pink} />;
        }
    }

    return (
        <Animated.View
            style={[
                styles.card,
                {
                    backgroundColor: colors.cardBackground,
                    minHeight: cardMinHeight,
                    maxHeight: cardMaxHeight,
                },
                animatedStyle
            ]}
        >
            <View style={styles.contentWrapper}>
                <View style={[styles.iconContainer, { padding: iconPadding }] }>
                    {renderIcon()}
                </View>
                <Text style={[styles.cardType, { color: colors.darkPink, marginBottom: 10 }]}>
                    {card.type.toUpperCase()} {isCustom ? '👑' : ''}
                </Text>
                <View style={styles.textContainer}>
                    <Text
                        style={[styles.cardText, { color: colors.text, fontSize: cardTextSize, lineHeight: cardTextLineHeight }]}
                        adjustsFontSizeToFit
                        minimumFontScale={0.55}
                        numberOfLines={maxTextLines}
                    >
                        {formattedText}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={{ position: 'absolute', top: 10, right: 10, padding: 5 }}
                onPress={onTimerStart}
            >
                <FontAwesome name="hourglass-start" size={24} color={colors.pink} />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 20,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 10,
        flexGrow: 1,
        flexShrink: 1,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
    },
    contentWrapper: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 18,
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 50,
    },
    cardType: {
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    textContainer: {
        flex: 1,
        width: '100%',
        marginTop: 6,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 2,
    },
    cardText: {
        fontWeight: 'bold',
        textAlign: 'center',
        flexShrink: 1,
    },
});
