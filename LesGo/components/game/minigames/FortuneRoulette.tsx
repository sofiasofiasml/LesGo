import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Easing } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    withDecay,
    cancelAnimation,
    useDerivedValue
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.85;

// Defined outcomes based on user request: +4, -4, Reto, Acción, Robar
const SEGMENTS = [
    { label: '+4 PTS', color: '#4CD964', type: 'points', value: 4, icon: 'plus' },
    { label: 'RETO', color: '#FF9500', type: 'challenge', value: 0, icon: 'bolt' },
    { label: '-4 PTS', color: '#FF3B30', type: 'points', value: -4, icon: 'minus' },
    { label: 'ROBAR', color: '#9B59B6', type: 'steal', value: 0, icon: 'hand-lizard-o' },
    { label: 'ACCIÓN', color: '#3498DB', type: 'action', value: 0, icon: 'group' },
    { label: '+4 PTS', color: '#4CD964', type: 'points', value: 4, icon: 'plus' },
    { label: 'SHOT', color: '#000000', type: 'drink', value: 0, icon: 'glass' },
    { label: 'ROBAR', color: '#9B59B6', type: 'steal', value: 0, icon: 'hand-lizard-o' },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;

interface FortuneRouletteProps {
    visible: boolean;
    onClose: (result: any) => void;
    colors: any;
}

export default function FortuneRoulette({ visible, onClose, colors }: FortuneRouletteProps) {
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Rotation value (0 -> 360 -> ...)
    const rotation = useSharedValue(0);

    // Track last haptic trigger to avoid spamming
    const lastHapticAngle = useRef(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }]
        };
    });

    // Haptics logic via derived value (runs on UI thread, needs careful handling)
    useDerivedValue(() => {
        const currentAngle = rotation.value % 360;
        const diff = Math.abs(currentAngle - lastHapticAngle.current);

        // Trigger haptic every segment pass (approx)
        if (diff > SEGMENT_ANGLE) {
            runOnJS(triggerHaptic)();
            lastHapticAngle.current = currentAngle;
        }
    });

    function triggerHaptic() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const spin = () => {
        if (spinning) return;
        setSpinning(true);
        setResult(null);

        // Random rotations (min 5 full spins + random offset)
        const randomOffset = Math.random() * 360;
        const spins = 360 * 5;
        const finalValue = rotation.value + spins + randomOffset;

        rotation.value = withTiming(finalValue, {
            duration: 4000,
            easing: Easing.out(Easing.cubic)
        }, (finished) => {
            if (finished) {
                runOnJS(handleFinish)(finalValue);
            }
        });
    };

    const handleFinish = (finalRotation: number) => {
        // Normalize angle to 0-360
        // Important: Visual rotation encompasses the whole wheel.
        // We have a pointer at the TOP (0 degrees usually, or 270?).
        // Let's assume pointer is at TOP (12 o'clock).
        // If we rotate the wheel clockwise, the segments move counter-clockwise relative to the pointer.

        const normalizedAngle = finalRotation % 360;

        // Calculate which segment is at the top (0 degrees)
        // Since 0 is usually 3 o'clock in trig, but in styles '0deg' is 12 up? No, 0deg is usually upright with no rotation.
        // If we have 8 segments, segment 0 is from -22.5 to +22.5?
        // Let's assume standard CSS drawing: 0 is top center.
        // Effective angle under pointer = (360 - normalizedRotation) % 360
        const effectiveAngle = (360 - normalizedAngle) % 360;

        const segmentIndex = Math.floor(effectiveAngle / SEGMENT_ANGLE);
        const winningSegment = SEGMENTS[segmentIndex];

        setResult(winningSegment);
        setSpinning(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground }]}>
                    <Text style={[styles.title, { color: colors.text }]}>¡RULETA DE LA SUERTE!</Text>

                    {/* WHEEL CONTAINER */}
                    <View style={styles.wheelContainer}>
                        {/* POINTER */}
                        <View style={styles.pointer} />

                        {/* WHEEL */}
                        <Animated.View style={[styles.wheel, animatedStyle]}>
                            {SEGMENTS.map((seg, index) => {
                                const angle = index * SEGMENT_ANGLE;
                                return (
                                    <View
                                        key={index}
                                        style={[
                                            styles.segment,
                                            {
                                                transform: [
                                                    { rotate: `${angle}deg` },
                                                    { translateY: -WHEEL_SIZE / 4 }
                                                ]
                                            }
                                        ]}
                                    >
                                        <View style={[styles.segmentInner, { backgroundColor: seg.color }]}>
                                            <Text style={styles.segmentText}>{seg.label}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </Animated.View>

                        {/* CENTER HUB */}
                        <TouchableOpacity
                            style={styles.centerHub}
                            onPress={spin}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.spinText}>{spinning ? '...' : 'GIRAR'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* RESULT MODAL OVERLAY */}
                    {result && (
                        <View style={styles.resultOverlay}>
                            <Text style={styles.resultTitle}>¡TE HA TOCADO!</Text>
                            <View style={[styles.resultBadge, { backgroundColor: result.color }]}>
                                <FontAwesome name={result.icon as any} size={40} color="white" />
                                <Text style={styles.resultValue}>{result.label}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.purple }]}
                                onPress={() => onClose(result)}
                            >
                                <Text style={styles.buttonText}>ACEPTAR</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '95%',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        minHeight: 500
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center'
    },
    wheelContainer: {
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    wheel: {
        width: '100%',
        height: '100%',
        borderRadius: WHEEL_SIZE / 2,
        borderWidth: 5,
        borderColor: 'white',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#333' // Base color
    },
    segment: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 100,
        height: WHEEL_SIZE / 2, // Radius
        justifyContent: 'flex-start',
        alignItems: 'center',
        // Pivot point creation via precise margins is tricky in React Native without 'transform-origin'
        // Alternative: Use a tall thin container rotated from center
        marginLeft: -50, // Center horizontally
        marginTop: 0,
        transformOrigin: 'bottom center', // Note: verify RN support or use translateY method 
        // Logic for segments:
        // Actually, creating a pie chart in vanilla RN views is hard.
        // Simplified approach: Render circles or just rotated rectangles acting as labels.
        // For 'Fortune Roulette', a clean SVG is better, but Views work if we are clever.
        // Let's try simple text labels rotated
    },
    // Better Segment Approach for CSS/View:
    // Create a container that is full size, rotate it. Place content at top.
    segmentInner: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
        // Visual trickery: this is just the label bubble, not the wedge
    },
    segmentText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center'
    },
    centerHub: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        zIndex: 20,
        borderWidth: 4,
        borderColor: '#ddd'
    },
    spinText: {
        fontWeight: 'bold',
        fontSize: 16
    },
    pointer: {
        position: 'absolute',
        top: -20,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderBottomWidth: 30,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#FFD700', // Gold pointer
        zIndex: 50
    },
    resultOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        zIndex: 100,
        padding: 20
    },
    resultTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },
    resultBadge: {
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 30,
        width: 200
    },
    resultValue: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center'
    },
    button: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18
    }
});
