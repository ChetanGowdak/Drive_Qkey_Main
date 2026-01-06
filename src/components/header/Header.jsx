import React, { useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { auth, provider } from "../../firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import {
  selectUserName,
  selectUserPhoto,
  setSignOutState,
  setUserLoginDetails,
} from "../../store/UserSlice";
import { selectSidebarBool, setSidebarBool } from "../../store/BoolSlice";
import { useNavigate } from "react-router-dom";
import LogoWrapperComponent from "./LogoWrapper";
import SearchBar from "./SearchBar";
import LeftIcons from "./LeftIcons";
import ProfileSection from "./ProfileSection";

const Header = () => {
  const dispatch = useDispatch();
  const userName = useSelector(selectUserName);
  const userPhoto = useSelector(selectUserPhoto);
  const sidebarBool = useSelector(selectSidebarBool);
  const navigate = useNavigate();

  // ✅ Dark Mode toggle + persistence
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  // ✅ Search focus state for mobile expansion
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    document.body.classList.add("theme-transitioning");
    document.body.classList.toggle("dark-mode", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setTimeout(() => document.body.classList.remove("theme-transitioning"), 300);
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // ✅ Handle Auth State Redirect
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        navigate("/home");
      }
    });
  }, []);

  const handleAuth = async () => {
    if (!userName) {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } else {
      await signOut(auth);
      dispatch(setSignOutState());
      navigate("/");
    }
  };

  const setUser = (user) => {
    dispatch(setUserLoginDetails({ name: user.displayName, photo: user.photoURL }));
  };

  return (
    <Container>
      <Wrapper $searchFocused={isSearchFocused}>
        <LogoWrapperComponent
          onClick={() => dispatch(setSidebarBool(!sidebarBool))}
          userName={userName}
        />

        {/* ✅ Search visible ONLY once, across all breakpoints */}
        {userName && (
          <div className="searchCenter">
            <SearchBar onFocusChange={setIsSearchFocused} />
          </div>
        )}

        <RightContainer $searchFocused={isSearchFocused}>
          {/* ✅ Desktop toggle only (in LeftIcons) */}
          <LeftIcons isDark={isDark} toggleTheme={toggleTheme} />

          {/* ✅ Mobile-only theme toggle */}
          <MobileThemeToggle onClick={toggleTheme} $isDark={isDark}>
            <span className="icon">{isDark ? "☀️" : "🌙"}</span>
          </MobileThemeToggle>

          <ProfileSection
            userPhoto={userPhoto}
            userName={userName}
            handleAuth={handleAuth}
          />
        </RightContainer>
      </Wrapper>
    </Container>
  );
};

export default Header;

/* ✅ Animations */
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(14, 165, 233, 0.3); }
  50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
`;

/* ✅ Styles */
const Container = styled.div.attrs(() => ({ className: "header-bar" }))`
  position: sticky;
  width: 100%;
  top: 0;
  z-index: 999;
  padding: 8px 0;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  gap: 16px;

  .searchCenter {
    flex: 1;
    display: flex;
    justify-content: center;
    max-width: 650px;
    transition: all 0.3s ease;
  }

  @media (max-width: 768px) {
    gap: ${props => props.$searchFocused ? '8px' : '16px'};
    
    /* Hide logo when search is focused on mobile */
    > div:first-child {
      ${props => props.$searchFocused && css`
        width: 0;
        min-width: 0;
        opacity: 0;
        overflow: hidden;
        padding: 0;
        margin: 0;
        pointer-events: none;
      `}
      transition: all 0.3s ease;
    }

    .searchCenter {
      flex: ${props => props.$searchFocused ? '1' : 'unset'};
      max-width: ${props => props.$searchFocused ? '100%' : '280px'};
    }
  }
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    ${props => props.$searchFocused && css`
      gap: 4px;
      
      /* Hide theme toggle when search is focused */
      > div:nth-child(2) {
        width: 0;
        opacity: 0;
        overflow: hidden;
        padding: 0;
        margin: 0;
      }
    `}
  }
`;

/* ✅ Mobile Theme Toggle */
const MobileThemeToggle = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    cursor: pointer;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    transition: all 0.3s ease;
    flex-shrink: 0;
    
    .icon {
      font-size: 18px;
      transition: transform 0.3s ease;
    }

    &:hover {
      background: var(--bg-tertiary);
      border-color: var(--primary);
      animation: ${glow} 2s ease-in-out infinite;
      
      .icon {
        transform: rotate(${props => props.$isDark ? '180deg' : '-30deg'});
      }
    }
  }
`;
