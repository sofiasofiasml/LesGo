import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface InfoModalProps {
    visible: boolean;
    onClose: () => void;
    colors: any;
    targetScore: number;
}

export default function InfoModal({ visible, onClose, colors, targetScore }: InfoModalProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalView}>
                <View style={[styles.modalContent, { backgroundColor: colors.modalBackground, maxHeight: '80%' }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.purple }]}>
                        <FontAwesome name="heart" size={30} color={colors.pink} />
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Sobre el Juego</Text>
                    </View>
                    <ScrollView style={{ width: '100%', marginTop: 15 }} showsVerticalScrollIndicator={true}>
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>LesGo - Yo Nunca (Versión Bollera)</Text>
                        </Text>

                        <Text style={[styles.infoText, { color: colors.text, marginTop: 15 }]}>
                            Creado con 🌈 por <Text style={{ fontWeight: 'bold', color: colors.pink }}>Sofía Martínez López</Text>
                        </Text>

                        <Text style={[styles.infoSection, { color: colors.text }]}>Sobre el juego</Text>
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            Este es un juego de fiesta diseñado para divertirse entre amigas. Incluye preguntas, retos y mecánicas especiales inspiradas en la cultura lésbica y queer.
                        </Text>

                        <Text style={[styles.infoSection, { color: colors.text }]}>Disclaimer Legal</Text>
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            • Este juego NO promueve el consumo de alcohol.{'\n'}
                            • Puedes jugarlo con cualquier tipo de bebida (refrescos, agua, zumos, etc.).{'\n'}
                            • Si decides jugar con alcohol, hazlo de forma responsable.{'\n'}
                            • No conduzcas si has bebido.{'\n'}
                            • Respeta siempre los límites de cada persona.
                        </Text>

                        <Text style={[styles.infoSection, { color: colors.text }]}>Cómo ganar</Text>
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            • La primera persona en llegar a {targetScore} puntos gana la ronda.{'\n'}
                            • ¡Pero la fiesta sigue! Podéis elegir continuar hasta la siguiente meta (+30 puntos) infinitamente.
                        </Text>

                        <Text style={[styles.infoSection, { color: colors.text }]}>Sistema de Puntos</Text>
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            🟢 Suave: 1 punto{'\n'}
                            🟡 Medio: 2 puntos{'\n'}
                            🔴 Picante: 3 puntos{'\n'}
                            🕹️ Minijuegos: +10 pts (Victoria) / -3 pts (Derrota){'\n'}
                            ⚡ Retos y Cartas Especiales: ¡Puntos extra!
                        </Text>

                        <Text style={[styles.infoText, { color: colors.text, marginTop: 20, fontSize: 12, opacity: 0.6, textAlign: 'center' }]}>
                            Versión 1.0 • 2024
                        </Text>
                    </ScrollView>
                    <TouchableOpacity
                        style={[styles.modalButton, { backgroundColor: colors.pink, marginTop: 15 }]}
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
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        paddingBottom: 15,
        borderBottomWidth: 1,
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    infoSection: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 5,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.9,
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
