import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    Easing,
    useDerivedValue
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
// Increase wheel size slightly for better visibility
const WHEEL_SIZE = width * 0.9;
const RADIUS = WHEEL_SIZE / 2;

// Trigonometry for 8 segments (45 degrees each)
// tan(22.5) = BaseHalf / Height
// Height = RADIUS
const TAN_22_5 = Math.tan(22.5 * Math.PI / 180); // ~0.4142
const HALF_BASE = RADIUS * TAN_22_5;
// Add slight overlap (2px) to prevent gaps
const TRIANGLE_HALF_BASE = HALF_BASE + 2;

const SEGMENTS = [
    { label: '+4', sub: 'PTS', color: '#4CD964', type: 'points', value: 4, icon: 'plus' },
    { label: 'RETO', sub: '', color: '#FF9500', type: 'challenge', value: 0, icon: 'bolt' },
    { label: '-4', sub: 'PTS', color: '#FF3B30', type: 'points', value: -4, icon: 'minus' },
    { label: 'ROBAR', sub: '', color: '#9B59B6', type: 'steal', value: 0, icon: 'hand-lizard-o' },
    { label: 'ACCIÓN', sub: '', color: '#3498DB', type: 'action', value: 0, icon: 'group' },
    { label: '+4', sub: 'PTS', color: '#4CD964', type: 'points', value: 4, icon: 'plus' },
    { label: 'SHOT', sub: '', color: '#000000', type: 'drink', value: 1, icon: 'glass' },
    { label: 'ROBAR', sub: '', color: '#9B59B6', type: 'steal', value: 0, icon: 'hand-lizard-o' },
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
    const rotation = useSharedValue(0);
    const lastHapticAngle = useSharedValue(0);

    // Reset on appear
    useEffect(() => {
        if (visible) {
            setSpinning(false);
            setResult(null);
            rotation.value = 0;
            lastHapticAngle.value = 0;
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }]
        };
    });

    useDerivedValue(() => {
        const currentAngle = rotation.value % 360;
        const diff = Math.abs(currentAngle - lastHapticAngle.value);
        // Trigger haptic every time we cross a segment boundary approx
        if (diff > SEGMENT_ANGLE) {
            runOnJS(triggerHaptic)();
            lastHapticAngle.value = currentAngle;
        }
    });

    function triggerHaptic() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const spin = () => {
        if (spinning || result) return;
        setSpinning(true);
        setResult(null);

        // Spin Logic:
        // Min 5 full rotations (1800 deg)
        // Add random offset (0-360)
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
        // Logic to determine winner:
        // Pointer is fixed at TOP (0 deg / 12 o'clock).
        // If wheel rotates clockwise, the segment index 0 (at 12 oclock initially) moves RIGHT.
        // We find the angle relative to the top.
        const normalized = finalRotation % 360;
        // The angle "under" the pointer is 360 - normalized rotation.
        const pointerAngle = (360 - normalized) % 360;

        // Segments are centered: Segment 0 at 0deg +/- 22.5deg.
        // So we shift angle by +22.5 to map 0deg to index 0 cleanly?
        // Let's visualize: 
        // 0 deg -> Index 0.
        // 45 deg -> Index 1.
        // Range for Index 0 is [337.5, 360] U [0, 22.5].
        // (pointerAngle + 22.5) % 360 / 45 -> floor -> index.
        const effectiveAngle = (pointerAngle + (SEGMENT_ANGLE / 2)) % 360;
        const segmentIndex = Math.floor(effectiveAngle / SEGMENT_ANGLE);

        const winningSegment = SEGMENTS[segmentIndex % SEGMENTS.length];

        setResult(winningSegment);
        setSpinning(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <View style={[styles.container, { backgroundColor: colors.modalBackground }]}>
                <TouchableOpacity
                    onPress={() => onClose(null)}
                    style={{ position: 'absolute', top: 15, right: 15, zIndex: 100 }}
                >
                    <FontAwesome name="close" size={30} color={colors.text} />
                </TouchableOpacity>

                <Text style={[styles.title, { color: colors.text }]}>¡RULETA DE LA SUERTE!</Text>

                <View style={styles.wheelContainer}>
                    {/* POINTER */}
                    <View style={styles.pointerContainer}>
                        <View style={styles.pointer} />
                    </View>

                    {/* WHEEL */}
                    <Animated.View style={[styles.wheel, animatedStyle]}>
                        {SEGMENTS.map((seg, index) => {
                            const rotate = index * SEGMENT_ANGLE;
                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.segmentContainer, // Full size container
                                        { transform: [{ rotate: `${rotate}deg` }] }
                                    ]}
                                >
                                    {/* The Triangle Wedge */}
                                    <View style={[styles.wedge, { borderTopColor: seg.color }]} />

                                    {/* Content inside wedge */}
                                    <View style={styles.contentContainer}>
                                        <Text style={styles.segmentText}>{seg.label}</Text>
                                        {seg.sub ? <Text style={styles.segmentSub}>{seg.sub}</Text> : null}
                                        <FontAwesome name={seg.icon as any} size={16} color="rgba(255,255,255,0.8)" style={{ marginTop: 5 }} />
                                    </View>
                                </View>
                            );
                        })}
                    </Animated.View>

                    {/* SPINNER BUTTON */}
                    <TouchableOpacity
                        style={styles.centerButton}
                        activeOpacity={0.9}
                        onPress={spin}
                    >
                        <Text style={styles.spinText}>{spinning ? '...' : 'GIRAR'}</Text>
                    </TouchableOpacity>
                </View>

                {/* RESULT MODAL */}
                {result && (
                    <View style={styles.resultOverlay}>
                        <Text style={styles.resultTitle}>¡TE HA TOCADO!</Text>
                        <View style={[styles.resultBadge, { backgroundColor: result.color }]}>
                            <FontAwesome name={result.icon as any} size={50} color="white" />
                            <Text style={styles.resultValue}>{result.label} {result.sub}</Text>
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
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000
    },
    container: {
        width: '95%',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        minHeight: 500,
        overflow: 'hidden' // Clip content if needed
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        letterSpacing: 1
    },
    wheelContainer: {
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 20
    },
    wheel: {
        width: '100%',
        height: '100%',
        borderRadius: RADIUS,
        borderWidth: 5,
        borderColor: '#fff',
        backgroundColor: '#222', // Behind wedges
        position: 'relative',
        overflow: 'hidden', // Clip the triangles to circle
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5
    },
    // The "Wedge" using border trick
    // Points DOWN (borderTopColor used)
    // Placed at Top Center of segment container
    wedge: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: TRIANGLE_HALF_BASE,
        borderRightWidth: TRIANGLE_HALF_BASE,
        borderTopWidth: RADIUS, // Height of wedge
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        // Top color set inline
        position: 'absolute',
        top: 0,
        left: (WHEEL_SIZE - (TRIANGLE_HALF_BASE * 2)) / 2, // Centered horizontally
    },
    segmentContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        // Allows rotation around center of wheel
    },
    contentContainer: {
        position: 'absolute',
        top: 40, // Distance from rim
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
        // Ensure text doesn't rotate locally if we didn't want it to, 
        // but here we rotate container so text rotates with wedge. Looks natural.
    },
    segmentText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowRadius: 2
    },
    segmentSub: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
        opacity: 0.9
    },
    centerButton: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        zIndex: 50,
        borderWidth: 4,
        borderColor: '#ddd'
    },
    spinText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 14
    },
    pointerContainer: {
        position: 'absolute',
        top: -15,
        zIndex: 60,
        elevation: 10
    },
    pointer: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderTopWidth: 25, // Points DOWN
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FFD700', // Gold
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2
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
        width: 250,
        elevation: 5
    },
    resultValue: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 15,
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
