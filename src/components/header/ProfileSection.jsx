import React from "react";
import styled, { keyframes } from "styled-components";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { auth } from "../../firebase";

const ProfileSection = ({ userPhoto, userName, handleAuth }) => {
  const email = auth?.currentUser?.email || "Not Available";

  return (
    <RightSection>
      <SignOut>
        <AvatarWrapper>
          <UserImg src={userPhoto} alt={userName} />
          <GradientRing />
        </AvatarWrapper>
        <DropDown>
          <ProfileCard>
            <ProfileImageLarge>
              <img src={userPhoto} alt="Profile" />
              <GradientRingLarge />
            </ProfileImageLarge>

            <InfoRow>
              <AccountCircleOutlinedIcon />
              <span className="name">{userName}</span>
            </InfoRow>
            <InfoRow>
              <EmailOutlinedIcon />
              <span className="email">{email}</span>
            </InfoRow>

            <Divider />

            <SignOutButton onClick={handleAuth}>
              <LogoutOutlinedIcon />
              Sign Out
            </SignOutButton>
          </ProfileCard>
        </DropDown>
      </SignOut>
    </RightSection>
  );
};

export default ProfileSection;

/* ================= ANIMATIONS ================= */

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeInScale = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(-10px) scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
`;

/* ================= STYLES ================= */

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 44px;
  height: 44px;
`;

const GradientRing = styled.div`
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6, #f472b6, #0ea5e9);
  background-size: 300% 300%;
  animation: ${rotate} 3s linear infinite;
  z-index: -1;

  &::after {
    content: '';
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: var(--bg-secondary);
  }
`;

const UserImg = styled.img`
  height: 100%;
  width: 100%;
  object-fit: cover;
  border-radius: 50%;
  position: relative;
  z-index: 1;
`;

const DropDown = styled.div`
  position: absolute;
  top: 60px;
  right: -20px;
  display: none;
  z-index: 1000;
`;

const SignOut = styled.div`
  position: relative;
  cursor: pointer;

  &:hover ${DropDown} {
    display: block;
  }
`;

const ProfileCard = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  width: 280px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
  text-align: left;
  animation: ${fadeInScale} 0.2s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 30px;
    width: 12px;
    height: 12px;
    background: var(--glass-bg);
    border-left: 1px solid var(--glass-border);
    border-top: 1px solid var(--glass-border);
    transform: rotate(45deg);
  }
`;

const ProfileImageLarge = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    position: relative;
    z-index: 1;
  }
`;

const GradientRingLarge = styled(GradientRing)`
  inset: -4px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--bg-tertiary);
  transition: all 0.2s ease;

  svg {
    color: var(--primary);
    font-size: 20px;
  }

  .name {
    font-weight: 600;
    font-size: 14px;
    color: var(--text);
  }

  .email {
    font-size: 12px;
    color: var(--text-muted);
    word-break: break-all;
  }

  &:hover {
    background: var(--gradient-glow);
    transform: translateX(4px);
  }
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  margin: 16px 0;
`;

const SignOutButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  color: white;
  font-weight: 600;
  font-size: 14px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);

  svg {
    color: white;
    font-size: 20px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;
