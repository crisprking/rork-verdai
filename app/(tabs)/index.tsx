import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Sparkles, Leaf, Send, RefreshCw, Crown } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { callGeminiAI } from '@/constants/api';
import Colors from '@/constants/colors';
import { useUser } from '@/hooks/useUser';
import { useUsageControl } from '@/hooks/useUsageControl';
import { UsageLimitModal } from '@/components/UsageLimitModal';
import { useRouter } from 'expo-router';

type CoreMessage =
  | { role: 'system'; content: string; }
  | { role: 'user'; content: string; }
  | { role: 'assistant'; content: string; };

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function HomeScreen() {
  const { user, isPremium } = useUser();
  const { usage, canUseFeature, trackUsage, getUpgradeMessage, getRemainingTime } = useUsageControl();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi ${user?.name || 'there'}! I'm FloraMind, your AI plant intelligence assistant. I can identify plant species, diagnose health issues, predict growth patterns, and provide personalized care recommendations using advanced machine learning. What would you like to know about your plants today?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [showUsageModal, setShowUsageModal] = useState<boolean>(false);

  const sendMessageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      console.log('Sending chat message:', prompt.substring(0, 50) + '...');
      const messages: CoreMessage[] = [
        {
          role: 'system' as const,
          content: 'You are FloraMind, an advanced AI plant intelligence assistant. You specialize in plant species identification, health diagnosis, growth prediction, and personalized care recommendations using machine learning. Provide detailed, scientific, yet accessible advice about plant care, identification, and health. Focus on AI-powered insights, data-driven recommendations, and intelligent plant care solutions. Always mention your AI capabilities and how they enhance plant care.'
        },
        {
          role: 'user' as const,
          content: prompt,
        },
      ];
      return await callGeminiAI(messages);
    },
    onSuccess: async (data) => {
      console.log('Chat response received');
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data || "I'm having trouble connecting right now. Please check your connection and try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Track usage after successful chat
      await trackUsage('chat');
    },
    onError: (error) => {
      console.error('Chat error:', error);
      let errorMessage = "I'm having trouble connecting right now. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('Authentication failed')) {
          errorMessage = "API key issue detected. Please verify your setup.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Request timed out. Try again.";
        } else if (error.message.includes('Server error') || error.message.includes('500')) {
          errorMessage = "Server is temporarily unavailable. Try again later.";
        } else if (error.message.includes('Bad request')) {
          errorMessage = "Invalid request. Please rephrase your question.";
        }
      }
      const errorMsg: Message = {
        id: Date.now().toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    },
  });

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || sendMessageMutation.isPending) return;

    // Check usage limits before sending
    const canUse = await canUseFeature('chat');
    if (!canUse) {
      setShowUsageModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(inputText.trim());
    setInputText('');
  }, [inputText, sendMessageMutation, canUseFeature]);

  const quickQuestions = [
    "🔍 Identify this plant species",
    "🏥 Diagnose plant health issues", 
    "📈 Predict growth patterns",
    "⚡ Optimize care schedule",
    "🌱 Carbon footprint analysis",
    "🤖 AI care recommendations"
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[Colors.light.luxuryGradientStart, Colors.light.luxuryGradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <View style={styles.headerIcon}>
              <Leaf color={Colors.light.luxuryGold} size={28} strokeWidth={2.5} />
            </View>
            <View style={styles.sparkleIcon}>
              <Sparkles color="rgba(212, 175, 55, 0.8)" size={16} />
            </View>
          </View>
          <Text style={styles.headerTitle}>FloraMind</Text>
          <Text style={styles.headerSubtitle}>AI Plant Intelligence & Care</Text>
          {isPremium ? (
            <View style={styles.premiumBadge}>
              <Crown color={Colors.light.luxuryGold} size={14} />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          ) : usage && usage.tier !== 'premium' && usage.chatLimit && usage.chatCount !== undefined && (
            <View style={styles.limitIndicator}>
              <Text style={styles.limitText}>{usage.chatLimit - usage.chatCount} chat messages remaining</Text>
              <View style={styles.limitDots}>
                {Array.from({ length: usage.chatLimit }).map((_, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.limitDot, 
                      i < (usage.chatCount || 0) ? styles.limitDotActive : styles.limitDotInactive
                    ]} 
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.aiMessage,
            ]}
          >
            {!message.isUser && (
              <View style={styles.aiIcon}>
                <Sparkles color={Colors.light.luxuryPrimary} size={16} strokeWidth={2} />
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.aiText,
                ]}
              >
                {message.text}
              </Text>
              {message.text.includes("trouble connectin") || message.text.includes("unavailable") ? (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => sendMessageMutation.mutate(inputText)}
                >
                  <RefreshCw color={Colors.light.luxuryPrimary} size={14} />
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ))}

        {sendMessageMutation.isPending && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={styles.aiIcon}>
              <ActivityIndicator color={Colors.light.luxuryPrimary} size="small" />
            </View>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.light.luxuryPrimary} size="small" />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputSection}>
        {messages.length === 1 && (
          <View style={styles.quickQuestionsContainer}>
            <Text style={styles.quickQuestionsTitle}>Quick Questions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickQuestions}>
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickQuestionButton}
                  onPress={async () => {
                    // Check usage limits before sending quick question
                    const canUse = await canUseFeature('chat');
                    if (!canUse) {
                      setShowUsageModal(true);
                      return;
                    }
                    
                    setInputText(question);
                    const userMessage: Message = {
                      id: Date.now().toString(),
                      text: question,
                      isUser: true,
                      timestamp: new Date(),
                    };
                    setMessages(prev => [...prev, userMessage]);
                    sendMessageMutation.mutate(question);
                  }}
                >
                  <Text style={styles.quickQuestionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask FloraMind about AI plant intelligence, species identification, or health diagnosis..."
              placeholderTextColor={Colors.light.luxuryTextSecondary}
              multiline
              maxLength={300}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || sendMessageMutation.isPending) && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Send 
                  color={(!inputText.trim() || sendMessageMutation.isPending) ? Colors.light.luxuryTextSecondary : "#FFFFFF"} 
                  size={20} 
                  strokeWidth={2}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <UsageLimitModal
        visible={showUsageModal}
        onClose={() => setShowUsageModal(false)}
        onUpgrade={() => {
          setShowUsageModal(false);
          router.push('/(tabs)/premium');
        }}
        title="Daily Chat Limit Reached"
        message={getUpgradeMessage()}
        remainingTime={getRemainingTime()}
        currentUsage={usage && usage.chatCount !== undefined && usage.chatLimit ? {
          count: usage.chatCount,
          limit: usage.chatLimit,
          tier: usage.tier
        } : undefined}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.luxuryBackground,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  sparkleIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.luxuryGold,
    letterSpacing: 0.3,
  },
  limitIndicator: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  limitText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  limitDots: {
    flexDirection: 'row',
    gap: 6,
  },
  limitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  limitDotActive: {
    backgroundColor: Colors.light.luxuryGold,
  },
  limitDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.luxuryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.light.luxuryAccent,
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
  },
  userBubble: {
    backgroundColor: Colors.light.luxuryPrimary,
    borderBottomRightRadius: 6,
    shadowColor: Colors.light.luxuryPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  aiBubble: {
    backgroundColor: Colors.light.luxuryCard,
    borderBottomLeftRadius: 6,
    shadowColor: Colors.light.luxuryPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.luxuryBorder,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: Colors.light.luxuryText,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: Colors.light.luxuryTextSecondary,
    fontStyle: 'italic',
    fontSize: 14,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.luxuryLight,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.light.luxuryAccent,
  },
  retryText: {
    fontSize: 12,
    color: Colors.light.luxuryPrimary,
    marginLeft: 4,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  inputSection: {
    backgroundColor: Colors.light.luxuryCard,
    borderTopWidth: 1,
    borderTopColor: Colors.light.luxuryBorder,
  },
  quickQuestionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.luxuryTextSecondary,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  quickQuestions: {
    flexDirection: 'row',
  },
  quickQuestionButton: {
    backgroundColor: Colors.light.luxuryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.light.luxuryAccent,
  },
  quickQuestionText: {
    fontSize: 13,
    color: Colors.light.luxuryPrimary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.light.luxuryIvory,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Colors.light.luxuryBorder,
    shadowColor: Colors.light.luxuryPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.luxuryText,
    maxHeight: 120,
    paddingVertical: 4,
    fontWeight: '400',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.luxuryPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: Colors.light.luxuryPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.luxuryTextSecondary,
    shadowOpacity: 0.1,
  },
});