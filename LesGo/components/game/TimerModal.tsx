import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

interface TimerModalProps {
    visible: boolean;
    timeLeft: number;
    onClose: () => void;
    onStartTimer: (seconds: number) => void;
    colors: any;
}

export default function TimerModal({ visible, timeLeft, onClose, onStartTimer, colors }: TimerModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalView}>
                <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
                    <Text style={{ fontSize: 80, fontWeight: 'bold', color: colors.text }}>{timeLeft}</Text>
                    <Text style={{ fontSize: 20, color: colors.text, marginBottom: 20 }}>segundos</Text>

                    <View style={{ flexDirection: 'row', gap: 20 }}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.pink, paddingHorizontal: 30 }]}
                            onPress={() => onStartTimer(10)}
                        >
                            <Text style={styles.buttonText}>10s</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.orange, paddingHorizontal: 30 }]}
                            onPress={() => onStartTimer(30)}
                        >
                            <Text style={styles.buttonText}>30s</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 20 }]}
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '85%',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButton: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});
