import React, { useState } from 'react';

interface FAQSectionProps {
  title: string;
  emoji: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  title,
  emoji,
  children,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="faq-section-toggle">
      <div
        className={`faq-section-header ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{emoji} {title}</span>
        <span className="toggle-icon">▼</span>
      </div>
      <div style={{ height: isOpen ? '16px' : '0px' }} />
      <div className={`faq-section-content ${isOpen ? '' : 'collapsed'}`}>
        {children}
      </div>
    </div>
  );
};
