import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styled, { keyframes } from "styled-components";

const PasswordModal = ({
  title = "Enter password",
  subtitle = "",
  onSubmit,
  onCancel,
  loading = false,
  error = "",
  isShareMode = false
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Shake animation on error
  useEffect(() => {
    if (error) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [error]);

  // Keyboard handlers
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && password && !loading) {
      onSubmit(password);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return ReactDOM.createPortal(
    <Overlay onClick={onCancel}>
      <ModalBox
        onClick={(e) => e.stopPropagation()}
        $shake={shake}
      >
        {/* Header */}
        <Header>
          <LockIcon>{isShareMode ? "🔗" : "🔐"}</LockIcon>
          <TitleSection>
            <Title>{title}</Title>
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
          </TitleSection>
        </Header>

        {/* Input Section */}
        <InputWrapper>
          <PasswordInput
            ref={inputRef}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            $error={!!error}
          />
          <ToggleButton
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </ToggleButton>
        </InputWrapper>

        {/* Error Message */}
        {error && <ErrorText>{error}</ErrorText>}

        {/* Actions */}
        <Actions>
          <CancelButton
            type="button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </CancelButton>
          <SubmitButton
            type="button"
            onClick={() => onSubmit(password)}
            disabled={!password || loading}
          >
            {loading ? (
              <Spinner />
            ) : (
              isShareMode ? "Get Link" : "Confirm"
            )}
          </SubmitButton>
        </Actions>
      </ModalBox>
    </Overlay>,
    document.body
  );
};

export default PasswordModal;

/* ================= ANIMATIONS ================= */

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { 
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const shakeAnim = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

/* ================= STYLES ================= */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  animation: ${fadeIn} 0.2s ease;

  body.dark-mode & {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const ModalBox = styled.div`
  width: 380px;
  max-width: 90vw;
  background: #ffffff;
  color: #202124;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.3s ease;
  ${props => props.$shake && `animation: ${shakeAnim} 0.5s ease;`}

  body.dark-mode & {
    background: #2d2d2d;
    color: #e8eaed;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
`;

const LockIcon = styled.div`
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #202124;

  body.dark-mode & {
    color: #e8eaed;
  }
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: #5f6368;

  body.dark-mode & {
    color: #9aa0a6;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 8px;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 14px 48px 14px 16px;
  border-radius: 10px;
  border: 2px solid ${props => props.$error ? '#ea4335' : '#dadce0'};
  background: #f8f9fa;
  color: #202124;
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${props => props.$error ? '#ea4335' : '#1a73e8'};
    background: #fff;
    box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(234, 67, 53, 0.15)' : 'rgba(26, 115, 232, 0.15)'};
  }

  &::placeholder {
    color: #80868b;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  body.dark-mode & {
    background: #3c3c3c;
    border-color: ${props => props.$error ? '#ea4335' : '#5f6368'};
    color: #e8eaed;

    &:focus {
      background: #404040;
      border-color: ${props => props.$error ? '#ea4335' : '#8ab4f8'};
      box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(234, 67, 53, 0.2)' : 'rgba(138, 180, 248, 0.2)'};
    }

    &::placeholder {
      color: #9aa0a6;
    }
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const ErrorText = styled.p`
  margin: 0 0 12px;
  font-size: 13px;
  color: #ea4335;
`;

const Actions = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #5f6368;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  body.dark-mode & {
    color: #9aa0a6;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.08);
    }
  }
`;

const SubmitButton = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #1557b0 0%, #0d47a1 100%);
    box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;
