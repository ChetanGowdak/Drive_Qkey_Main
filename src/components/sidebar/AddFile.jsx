import React from "react";
import styled, { keyframes } from "styled-components";

const AddFile = ({ onClick }) => {
    return (
        <SidebarBtn>
            <GradientButton title="New File" onClick={onClick}>
                <PlusIcon>
                    <svg width="24" height="24" viewBox="0 0 36 36">
                        <path fill="#34A853" d="M16 16v14h4V20z" />
                        <path fill="#4285F4" d="M30 16H20l-4 4h14z" />
                        <path fill="#FBBC05" d="M6 16v4h10l4-4z" />
                        <path fill="#EA4335" d="M20 16V6h-4v14z" />
                    </svg>
                </PlusIcon>
                <span>New</span>
                <ShimmerOverlay />
            </GradientButton>
        </SidebarBtn>
    );
};

export default AddFile;

/* ================= ANIMATIONS ================= */

const shimmer = keyframes`
  0% { left: -100%; }
  100% { left: 100%; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 4px 15px rgba(0, 174, 255, 0.3); }
  50% { box-shadow: 0 6px 25px rgba(163, 129, 242, 0.4); }
`;

/* ================= STYLES ================= */

const SidebarBtn = styled.div`
  padding: 12px 16px;
`;

const GradientButton = styled.button`
  position: relative;
  background: linear-gradient(135deg, #6fccf7ff 0%, #9d86d4ff 50%, #f472b6 100%);
  background-size: 200% 200%;
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 16px;
  padding: 12px 20px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s ease;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);

  span {
    font-size: 15px;
    font-weight: 600;
    color: white;
    letter-spacing: 0.3px;
  }

  &:hover {
    background-position: 100% 50%;
    transform: translateY(-2px) scale(1.02);
    animation: ${glow} 2s ease-in-out infinite;
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  @media screen and (max-width: 768px) {
    padding: 10px;
    border-radius: 12px;
    justify-content: center;

    span {
      display: none;
    }
  }
`;

const PlusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 3px;
  backdrop-filter: blur(4px);

  svg {
    width: 25px;
    height: 25px;
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
