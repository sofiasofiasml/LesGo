import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    Easing,
    interpolate,
    useAnimatedReaction,
    runOnJS
} from 'react-native-reanimated';

// Screen dimensions for responsive card sizing if needed (optional)
const { width } = Dimensions.get('window');

interface GameCardProps {
    card: any;
    formattedText: string;
    isCustom: boolean;
    colors: any;
    onTimerStart: () => void;
}

export default function GameCard({ card, formattedText, isCustom, colors, onTimerStart }: GameCardProps) {
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
            case 'question': return <FontAwesome name="question-circle" size={40} color={colors.lightOrange} />;
            case 'challenge': return <FontAwesome name="bolt" size={40} color={colors.pink} />;
            case 'rule': return <FontAwesome name="gavel" size={40} color="#9b59b6" />;
            case 'viral': return <FontAwesome name="hashtag" size={40} color="#2ecc71" />;
            default: return <FontAwesome name="gamepad" size={40} color={colors.pink} />;
        }
    }

    return (
        <Animated.View style={[styles.card, { backgroundColor: colors.cardBackground }, animatedStyle]}>
            <View style={styles.iconContainer}>
                {renderIcon()}
            </View>
            <Text style={[styles.cardType, { color: colors.darkPink, marginBottom: 10 }]}>
                {card.type.toUpperCase()} {isCustom ? '👑' : ''}
            </Text>
            <Text style={[styles.cardText, { color: colors.text }]}>
                {formattedText}
            </Text>
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
        minHeight: 380, // Increased from 250
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
    },
    iconContainer: {
        marginBottom: 30, // Increased spacing
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 50,
    },
    cardType: {
        fontSize: 16, // Increased
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    cardText: {
        fontSize: 28, // Increased from 24
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
