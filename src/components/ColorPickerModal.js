import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const ColorPickerModal = ({ visible, onClose, currentColor, onColorSelect }) => {
  const predefinedColors = [
    '#4D873D', '#FF7A00', '#3B82F6', '#EF4444', '#8B5CF6',
    '#10B981', '#F59E0B', '#EC4899', '#6B7280', '#000000'
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <SafeAreaView>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une couleur</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.colorGrid}>
              {predefinedColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    currentColor === color && styles.selectedColor
                  ]}
                  onPress={() => {
                    onColorSelect(color);
                    onClose();
                  }}
                />
              ))}
            </View>

            <View style={styles.currentColorContainer}>
              <Text style={styles.currentColorLabel}>Couleur actuelle:</Text>
              <View style={[styles.currentColorPreview, { backgroundColor: currentColor }]} />
              <Text style={styles.currentColorText}>{currentColor}</Text>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 5,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#333',
    borderWidth: 3,
  },
  currentColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  currentColorLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  currentColorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  currentColorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

export default ColorPickerModal;