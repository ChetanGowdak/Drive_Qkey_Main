import styled, { keyframes } from "styled-components";
import { Modal } from "@mui/material";
import Lottie from "react-lottie-player";
import linkedInJson from "../lottie/linkedInLottie.json";
import githubJson from "../lottie/githubLottie.json";
import closeJson from "../lottie/closeLottie.json";

const teamMembers = [
  {
    name: "Chetan Gowda K",
    email: "chetangowdak@gmail.com",
    image: "/WhatsApp Image 2025-10-27 at 10.07.24.jpeg",
    github: "https://github.com/ChetanGowdak",
    linkedin: "https://www.linkedin.com/in/chetan-gowda-23a04938b",
  },
  {
    name: "M Premananda",
    email: "premananda@gmail.com",
    image: "/WhatsApp Image 2025-10-27 at 10.06.45.jpeg",
    github: "https://github.com/M-Premananda",
    linkedin: "https://www.linkedin.com/in/m-premananda-385110355/",
  },
  {
    name: "Ganesh",
    email: "ganesh@gmail.com",
    image: "/WhatsApp Image 2025-10-27 at 10.16.25.jpeg",
    github: "https://github.com/Ganesh7846",
    linkedin: "https://www.linkedin.com/in/ganesh-n-bambulage-340691380/",
  },
  {
    name: "Aishwarya K",
    email: "aishwarya@gmail.com",
    image: "/WhatsApp Image 2025-10-27 at 10.10.24.jpeg",
    github: "https://github.com/Aishubidda",
    linkedin: "https://www.linkedin.com/in/aishwarya17407",
  }
];

const HelpModal = ({ openHelp, closeHelpModal }) => {
  return (
    <Modal open={openHelp} onClose={closeHelpModal}>
      <ModalContainer>
        <CloseButton onClick={closeHelpModal}>
          <Lottie
            loop
            animationData={closeJson}
            play
            style={{ width: 32, height: 32 }}
          />
        </CloseButton>

        {/* Header */}
        <ModalHeader>
          <LogoImage src="/logo.png" alt="QCrypt Cloud" />
          <HeaderText>
            <h2>QCrypt Cloud</h2>
            <TeamBadge>TEAM 4</TeamBadge>
          </HeaderText>
        </ModalHeader>

        {/* Team List - Vertical cards */}
        <TeamList>
          {teamMembers.map((member, index) => (
            <TeamCard key={index} $delay={index * 0.08}>
              {/* Photo with gradient border */}
              <PhotoWrapper>
                <MemberPhoto>
                  <img src={member.image} alt={member.name} />
                </MemberPhoto>
              </PhotoWrapper>

              {/* Info */}
              <MemberInfo>
                <MemberName>{member.name}</MemberName>
                <MemberEmail>📧 {member.email}</MemberEmail>
              </MemberInfo>

              {/* Social Links */}
              <SocialLinks>
                <SocialBtn href={member.github} target="_blank" rel="noopener noreferrer">
                  <Lottie loop animationData={githubJson} play style={{ width: 24, height: 24 }} />
                </SocialBtn>
                <SocialBtn href={member.linkedin} target="_blank" rel="noopener noreferrer">
                  <Lottie loop animationData={linkedInJson} play style={{ width: 24, height: 24 }} />
                </SocialBtn>
              </SocialLinks>
            </TeamCard>
          ))}
        </TeamList>
      </ModalContainer>
    </Modal>
  );
};

export default HelpModal;

/* ================= ANIMATIONS ================= */

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

/* ================= STYLES ================= */

const ModalContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  width: 100%;
  max-width: 460px;
  max-height: 85vh;
  padding: 28px;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
  animation: ${fadeIn} 0.3s ease;
  overflow-y: auto;

  @media (max-width: 500px) {
    max-width: 95%;
    padding: 20px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: rotate(90deg);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border);
`;

const LogoImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: contain;
`;

const HeaderText = styled.div`
  h2 {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 6px;
  }
`;

const TeamBadge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  color: white;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  padding: 3px 10px;
  border-radius: 50px;
`;

const TeamList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TeamCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 16px;
  transition: all 0.25s ease;
  animation: ${slideIn} 0.4s ease backwards;
  animation-delay: ${props => props.$delay}s;

  &:hover {
    transform: translateX(6px);
    border-color: var(--primary);
    box-shadow: 0 4px 20px rgba(14, 165, 233, 0.12);
  }
`;

const PhotoWrapper = styled.div`
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  padding: 3px;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  border-radius: 50%;
`;

const MemberPhoto = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-tertiary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MemberName = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MemberEmail = styled.span`
  font-size: 11px;
  color: var(--text-muted);
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 8px;
`;

const SocialBtn = styled.a`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    border-color: var(--primary);
    background: var(--gradient-glow);
  }
`;
