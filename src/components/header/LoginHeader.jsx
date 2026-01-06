import React from "react";
import styled, { keyframes } from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { selectHelpModal, setHelpModal } from "../../store/HelpSlice";
import { HelpIcon } from "../common/SvgIcons";
import HelpModal from "../common/Modal";

/* ================= ANIMATIONS ================= */

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(14, 165, 233, 0.3); }
  50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
`;

/* ================= STYLES ================= */

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 15, 28, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
`;

const BrandText = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.5px;

  .q {
    background: linear-gradient(135deg, #0ea5e9, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .crypt {
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .cloud {
    background: linear-gradient(135deg, #f472b6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.6);
    transition: color 0.2s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(139, 92, 246, 0.4);
    animation: ${glow} 2s ease-in-out infinite;

    svg {
      color: #fff;
    }
  }
`;

const SignUpButton = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(14, 165, 233, 0.3);
  }

  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 12px;
  }
`;

/* ================= COMPONENT ================= */

const LoginHeader = () => {
  const dispatch = useDispatch();
  const openHelp = useSelector(selectHelpModal);

  return (
    <>
      <HelpModal openHelp={openHelp} closeHelpModal={() => dispatch(setHelpModal(false))} />

      <HeaderContainer>
        <HeaderContent>
          {/* Logo */}
          <LogoSection>
            <LogoImage src="/logo.png" alt="QCrypt Cloud" />
            <BrandText>
              <span className="q">Q</span>
              <span className="crypt">Crypt</span>
              <span className="cloud">Cloud</span>
            </BrandText>
          </LogoSection>

          {/* Right Side */}
          <RightSection>
            <IconButton onClick={() => dispatch(setHelpModal(true))} title="About Us">
              <HelpIcon />
            </IconButton>
            <SignUpButton
              href="https://accounts.google.com/signup"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sign Up
            </SignUpButton>
          </RightSection>
        </HeaderContent>
      </HeaderContainer>
    </>
  );
};

export default LoginHeader;
