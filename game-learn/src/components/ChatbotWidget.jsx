import React, { useEffect } from 'react';

const ChatbotWidget = () => {
  useEffect(() => {
    // Load JotForm agent script
    const script = document.createElement('script');
    script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-embedded-agent.js';
    script.async = true;
    document.body.appendChild(script);

    // Initialize JotForm agent after script loads
    script.onload = () => {
      if (window.AgentInitializer) {
        window.AgentInitializer.init({
          agentRenderURL: "https://agent.jotform.com/0195c26935da7ac4a53add2a4af082917cbb",
          rootId: "JotformAgent-0195c26935da7ac4a53add2a4af082917cbb",
          formID: "0195c26935da7ac4a53add2a4af082917cbb",
          queryParams: ["skipWelcome=1", "maximizable=1"],
          domain: "https://www.jotform.com",
          isDraggable: false,
          background: "linear-gradient(180deg, #6C73A8 0%, #6C73A8 100%)",
          buttonBackgroundColor: "#0066C3",
          buttonIconColor: "#FFFFFF",
          variant: false,
          customizations: {
            "greeting": "Yes",
            "greetingMessage": "Hi! How can I assist you with your learning journey?",
            "openByDefault": "No",
            "pulse": "Yes",
            "position": "right",
            "autoOpenChatIn": "0"
          },
          isVoice: undefined
        });
      }
    };

    // Create container for JotForm agent
    const container = document.createElement('div');
    container.id = 'JotformAgent-0195c26935da7ac4a53add2a4af082917cbb';
    document.body.appendChild(container);

    // Cleanup function
    return () => {
      document.body.removeChild(script);
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, []);

  // This component doesn't render anything - it just injects the chatbot
  return null;
};

export default ChatbotWidget; 