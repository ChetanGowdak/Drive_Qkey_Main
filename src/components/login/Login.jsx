import React, { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUserLoginDetails } from "../../store/UserSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      navigate("/home");
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = (user) => {
    dispatch(
      setUserLoginDetails({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      })
    );
  };

  return (
    <Container>
      {/* Animated Mesh Background */}
      <MeshBackground />

      {/* Floating Particles - Using CSS variables to avoid class generation */}
      <ParticlesContainer>
        {[...Array(15)].map((_, i) => (
          <Particle
            key={i}
            style={{
              '--delay': `${i * 0.7}s`,
              '--size': `${3 + (i % 4)}px`,
              '--left': `${5 + (i * 6.5)}%`,
              '--duration': `${12 + (i % 5) * 2}s`
            }}
          />
        ))}
      </ParticlesContainer>

      {/* Glowing Ring Effect */}
      <GlowRing />

      <ContentWrapper>
        {/* Hero Section */}
        <HeroSection
          as={motion.div}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >

          <HeroTitle>
            <span className="line1">Secure Your</span>
            <span className="line2">Digital World</span>
            <GradientLine />
          </HeroTitle>

          <HeroDescription>
            Experience next-generation cloud storage with military-grade encryption.
            Your files, protected by quantum-resistant security.
          </HeroDescription>

          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>🔐</FeatureIcon>
              <FeatureText>
                <h4>End-to-End</h4>
                <p>Zero-knowledge encryption</p>
              </FeatureText>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>⚡</FeatureIcon>
              <FeatureText>
                <h4>Lightning Fast</h4>
                <p>Instant file access</p>
              </FeatureText>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>🌐</FeatureIcon>
              <FeatureText>
                <h4>Global CDN</h4>
                <p>Access anywhere</p>
              </FeatureText>
            </FeatureCard>
          </FeatureGrid>
        </HeroSection>

        {/* Login Card */}
        <LoginCard
          as={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          $isHovering={isHovering}
        >
          <CardGlow $isHovering={isHovering} />

          <LogoSection>
            <AnimatedLogo>
              <LogoOuter>
                <LogoInner>
                  <LogoCore>Q</LogoCore>
                </LogoInner>
              </LogoOuter>
            </AnimatedLogo>
          </LogoSection>

          <BrandName>
            <span className="q">Q</span>
            <span className="crypt">Crypt</span>
            <span className="cloud">Cloud</span>
          </BrandName>

          <Tagline>Military-Grade Cloud Security</Tagline>

          <Divider />

          <GoogleButton
            onClick={handleAuth}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <GoogleIcon>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </GoogleIcon>
                <span>Continue with Google</span>
              </>
            )}
            <ButtonShimmer />
          </GoogleButton>

          <SecurityBadges>
            <Badge>🔒 256-bit SSL</Badge>
            <Badge>🔐 AES-256</Badge>
            <Badge>🛡️ GDPR</Badge>
          </SecurityBadges>

          <TermsText>
            By continuing, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>
          </TermsText>

          <FooterBrand>
            made by <span className="team">TEAM 4</span>
          </FooterBrand>
        </LoginCard>
      </ContentWrapper>

      {/* Decorative Elements */}
      <FloatingShapes>
        <Shape className="shape1" />
        <Shape className="shape2" />
        <Shape className="shape3" />
      </FloatingShapes>
    </Container>
  );
};

export default Login;

/* ================= ANIMATIONS ================= */

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const rotateGlow = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const meshMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const particleFloat = keyframes`
  0%, 100% { 
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { 
    transform: translateY(-100vh) scale(1);
    opacity: 0;
  }
`;

const ringPulse = keyframes`
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.5;
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const gradientLine = keyframes`
  0% { width: 0; opacity: 0; }
  50% { opacity: 1; }
  100% { width: 120px; opacity: 1; }
`;

/* ================= STYLES ================= */

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding-top: 80px;
  background: linear-gradient(135deg, #0a0f1c 0%, #0f172a 30%, #1e1b4b 70%, #312e81 100%);
`;

const MeshBackground = styled.div`
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(244, 114, 182, 0.1) 0%, transparent 60%);
  background-size: 200% 200%;
  animation: ${meshMove} 15s ease infinite;
`;

const ParticlesContainer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
`;

const Particle = styled.div`
  position: absolute;
  width: var(--size, 4px);
  height: var(--size, 4px);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  left: var(--left, 50%);
  animation: ${particleFloat} var(--duration, 12s) linear infinite;
  animation-delay: var(--delay, 0s);
`;

const GlowRing = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  border: 2px solid rgba(139, 92, 246, 0.2);
  border-radius: 50%;
  animation: ${ringPulse} 4s ease-in-out infinite;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    inset: -50px;
    border: 1px solid rgba(14, 165, 233, 0.1);
    border-radius: 50%;
    animation: ${ringPulse} 4s ease-in-out infinite 0.5s;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 50px;
    border: 1px solid rgba(244, 114, 182, 0.15);
    border-radius: 50%;
    animation: ${ringPulse} 4s ease-in-out infinite 1s;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  max-width: 1200px;
  width: 100%;
  padding: 2rem;
  z-index: 10;

  @media screen and (max-width: 1024px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const HeroSection = styled.div`
  flex: 1;
  max-width: 500px;

  @media screen and (max-width: 1024px) {
    text-align: center;
    max-width: 100%;
  }
`;

const LogoBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 50px;
  padding: 8px 16px;
  margin-bottom: 1.5rem;
  font-size: 0.8rem;
  color: #a78bfa;
  font-weight: 500;

  @media screen and (max-width: 1024px) {
    margin: 0 auto 1.5rem;
  }
`;

const ShieldIcon = styled.span`
  font-size: 1rem;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  position: relative;

  .line1 {
    display: block;
    color: rgba(255, 255, 255, 0.9);
  }

  .line2 {
    display: block;
    background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media screen and (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const GradientLine = styled.div`
  height: 4px;
  background: linear-gradient(90deg, #0ea5e9, #8b5cf6, #f472b6);
  border-radius: 2px;
  margin-top: 1rem;
  animation: ${gradientLine} 1s ease forwards;
  animation-delay: 0.5s;
  width: 0;

  @media screen and (max-width: 1024px) {
    margin: 1rem auto 0;
  }
`;

const HeroDescription = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 440px;

  @media screen and (max-width: 1024px) {
    margin: 0 auto 2rem;
  }
`;

const FeatureGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media screen and (max-width: 1024px) {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const FeatureCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(139, 92, 246, 0.3);
    transform: translateX(8px);
  }

  @media screen and (max-width: 1024px) {
    flex: 0 0 auto;
    
    &:hover {
      transform: translateY(-4px);
    }
  }
`;

const FeatureIcon = styled.div`
  font-size: 1.5rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 12px;
`;

const FeatureText = styled.div`
  h4 {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 4px 0;
  }

  p {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    margin: 0;
  }
`;

const LoginCard = styled.div`
  width: 400px;
  max-width: 100%;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 2.5rem 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.4),
    0 0 100px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.4s ease;

  ${props => props.$isHovering && css`
    border-color: rgba(139, 92, 246, 0.3);
    box-shadow: 
      0 30px 60px rgba(0, 0, 0, 0.5),
      0 0 120px rgba(139, 92, 246, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  `}
`;

const CardGlow = styled.div`
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg,
    transparent,
    rgba(14, 165, 233, 0.1),
    transparent,
    rgba(139, 92, 246, 0.1),
    transparent,
    rgba(244, 114, 182, 0.1),
    transparent
  );
  animation: ${rotateGlow} 10s linear infinite;
  opacity: ${props => props.$isHovering ? 1 : 0};
  transition: opacity 0.4s ease;
  pointer-events: none;
`;

const LogoSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const AnimatedLogo = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
`;

const LogoOuter = styled.div`
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: 50%;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6, #f472b6) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: ${spin} 8s linear infinite;
`;

const LogoInner = styled.div`
  position: absolute;
  inset: 8px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(139, 92, 246, 0.2));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoCore = styled.div`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const BrandName = styled.h2`
  text-align: center;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 0.5rem;

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
`;

const Tagline = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  margin-bottom: 1.5rem;
`;

const GoogleButton = styled(motion.button)`
  position: relative;
  width: 100%;
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  &:hover {
    background: #ffffff;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const GoogleIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonShimmer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: ${shimmer} 2s ease-in-out infinite;
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const SecurityBadges = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 1.5rem 0;
  flex-wrap: wrap;
`;

const Badge = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const TermsText = styled.p`
  text-align: center;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.6;
  margin-bottom: 1rem;

  a {
    color: #a78bfa;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #c4b5fd;
    }
  }
`;

const FooterBrand = styled.p`
  text-align: center;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);

  .team {
    color: #f59e0b;
    font-weight: 700;
  }
`;

const FloatingShapes = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
`;

const Shape = styled.div`
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(14, 165, 233, 0.1));
  animation: ${float} 6s ease-in-out infinite;

  &.shape1 {
    width: 150px;
    height: 150px;
    top: 10%;
    left: 5%;
    animation-delay: 0s;
  }

  &.shape2 {
    width: 100px;
    height: 100px;
    bottom: 15%;
    right: 8%;
    animation-delay: -2s;
  }

  &.shape3 {
    width: 80px;
    height: 80px;
    top: 60%;
    left: 10%;
    animation-delay: -4s;
  }
`;
