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
      {/* Floating Orbs Background */}
      <FloatingOrbs>
        <Orb className="orb1" />
        <Orb className="orb2" />
        <Orb className="orb3" />
      </FloatingOrbs>

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
          <InputGlow $error={!!error} $focused={true} />
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
              <>
                {isShareMode ? "Get Link" : "Confirm"}
                <ShimmerOverlay />
              </>
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
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const shakeAnim = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-10px); }
  40%, 80% { transform: translateX(10px); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(5deg); }
  66% { transform: translateY(15px) rotate(-5deg); }
`;

const shimmer = keyframes`
  0% { left: -100%; }
  100% { left: 100%; }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

/* ================= STYLES ================= */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  animation: ${fadeIn} 0.2s ease;
  overflow: hidden;
`;

const FloatingOrbs = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
`;

const Orb = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: ${float} 10s ease-in-out infinite;

  &.orb1 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #0ea5e9, #38bdf8);
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  &.orb2 {
    width: 250px;
    height: 250px;
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
    top: 50%;
    right: 10%;
    animation-delay: -3s;
  }

  &.orb3 {
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, #f472b6, #ec4899);
    bottom: 10%;
    left: 30%;
    animation-delay: -6s;
  }
`;

const ModalBox = styled.div`
  width: 400px;
  max-width: 90vw;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: var(--text);
  padding: 28px;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: ${slideUp} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 1;
  
  ${props => props.$shake && `animation: ${shakeAnim} 0.5s ease;`}
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const LockIcon = styled.div`
  font-size: 28px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.3);
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 12px;
`;

const InputGlow = styled.div`
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  background: ${props => props.$error
    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
    : 'linear-gradient(135deg, #0ea5e9, #8b5cf6, #f472b6)'};
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
  filter: blur(6px);
  animation: ${glow} 2s ease-in-out infinite;

  ${InputWrapper}:focus-within & {
    opacity: 0.6;
  }
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 16px 52px 16px 18px;
  border-radius: 12px;
  border: 2px solid ${props => props.$error ? 'var(--error)' : 'var(--border)'};
  background: var(--bg-secondary);
  color: var(--text);
  font-size: 15px;
  font-weight: 500;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${props => props.$error ? 'var(--error)' : 'var(--primary)'};
    background: var(--bg-secondary);
  }

  &::placeholder {
    color: var(--text-muted);
    font-weight: 400;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  opacity: 0.7;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
  }
`;

const ErrorText = styled.p`
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--error);
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '⚠️';
    font-size: 14px;
  }
`;

const Actions = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: var(--bg-tertiary);
    border-color: var(--text-muted);
    color: var(--text);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  position: relative;
  padding: 12px 28px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #f472b6 100%);
  background-size: 200% 200%;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s ease;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);

  &:hover:not(:disabled) {
    background-position: 100% 50%;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ShimmerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: ${shimmer} 3s ease-in-out infinite;
  pointer-events: none;
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;
