import React from "react";
import styled, { keyframes } from "styled-components";
import { HelpIcon } from "../common/SvgIcons";
import { useDispatch, useSelector } from "react-redux";
import { selectHelpModal, setHelpModal } from "../../store/HelpSlice";
import HelpModal from "../common/Modal";

const LeftIcons = ({ isDark, toggleTheme }) => {
  const openHelp = useSelector(selectHelpModal);
  const dispatch = useDispatch();

  return (
    <LeftSection>
      <HelpModal openHelp={openHelp} closeHelpModal={() => dispatch(setHelpModal(false))} />

      <IconButton onClick={() => dispatch(setHelpModal(true))} title="Help">
        <HelpIcon />
      </IconButton>

      {/* ✅ Animated Theme Toggle */}
      <ThemeToggle onClick={toggleTheme} $isDark={isDark} title={isDark ? "Light Mode" : "Dark Mode"}>
        <span className="icon-wrapper">
          <span className="sun">☀️</span>
          <span className="moon">🌙</span>
        </span>
      </ThemeToggle>
    </LeftSection>
  );
};

export default LeftIcons;

/* ================= ANIMATIONS ================= */

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(14, 165, 233, 0.3); }
  50% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.5); }
`;

/* ================= STYLES ================= */

const LeftSection = styled.div`
  margin-right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const IconButton = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  cursor: pointer;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  transition: all 0.3s ease;

  svg {
    font-size: 20px;
    color: var(--text-muted);
    transition: all 0.3s ease;
  }

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary);
    transform: translateY(-2px);

    svg {
      color: var(--primary);
    }
  }
`;

const ThemeToggle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  transition: all 0.3s ease;
  overflow: hidden;

  .icon-wrapper {
    position: relative;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sun, .moon {
    position: absolute;
    font-size: 18px;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .sun {
    opacity: ${props => props.$isDark ? 1 : 0};
    transform: ${props => props.$isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)'};
  }

  .moon {
    opacity: ${props => props.$isDark ? 0 : 1};
    transform: ${props => props.$isDark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)'};
  }

  &:hover {
    background: var(--gradient-glow);
    border-color: var(--primary);
    animation: ${glow} 2s ease-in-out infinite;
    transform: translateY(-2px);
  }
`;
