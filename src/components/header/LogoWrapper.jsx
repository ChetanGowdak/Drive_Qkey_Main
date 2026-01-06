import React from "react";
import styled, { keyframes } from "styled-components";
import { MenuIcon } from "../common/SvgIcons";
import { Link } from "react-router-dom";

const LogoWrapperComponent = ({ onClick, userName }) => {
  return (
    <LogoWrapper>
      <MenuButton onClick={onClick}>
        {userName && <MenuIcon />}
      </MenuButton>
      <Link to={"/home"}>
        <Logo>
          <LogoImage src="/logo.png" alt="QCrypt Cloud Logo" />
          <LogoText>
            <span className="q">Q</span>
            <span className="crypt">Crypt</span>
            <span className="cloud">Cloud</span>
          </LogoText>
        </Logo>
      </Link>
    </LogoWrapper>
  );
};

export default LogoWrapperComponent;

/* ================= ANIMATIONS ================= */

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 8px rgba(14, 165, 233, 0.4)); }
  50% { filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.5)); }
`;

/* ================= STYLES ================= */

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MenuButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.2s ease;

  svg {
    font-size: 24px;
    color: var(--text-muted);
    transition: color 0.2s ease;
  }

  &:hover {
    background: var(--bg-tertiary);
    
    svg {
      color: var(--primary);
    }
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(14, 165, 233, 0.05);
  }
`;

const LogoImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: contain;
  animation: ${glow} 3s ease-in-out infinite;
`;

const LogoText = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.5px;

  .q {
    background: linear-gradient(135deg, #0ea5e9, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .crypt {
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cloud {
    background: linear-gradient(135deg, #f472b6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media screen and (max-width: 600px) {
    display: none;
  }
`;
