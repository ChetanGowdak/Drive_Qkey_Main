import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  MobileScreenShareIcon,
  QueryBuilderIcon,
  StarBorderIcon,
  DeleteOutlineIcon,
  CloudQueueIcons,
  HelpIcon,
} from "../common/SvgIcons";
import { Modal } from "@mui/material";
import { NavLink } from "react-router-dom";
import { getFilesForUser } from "../common/firebaseApi";
import { auth } from "../../firebase";
import { changeBytes } from "../common/common";
import HelpModal from "../common/Modal";
import { useDispatch, useSelector } from "react-redux";
import { selectHelpModal, setHelpModal } from "../../store/HelpSlice";
import Lottie from "react-lottie-player";
import closeJson from "../lottie/closeLottie.json";

const SidebarTabs = () => {
  const openHelp = useSelector(selectHelpModal);
  const dispatch = useDispatch();
  const [files, setFiles] = useState([]);
  const [storage, setStorage] = useState("");
  const [size, setSize] = useState("");
  const [openStorageModal, setOpenStorageModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const unsubscribeFiles = await getFilesForUser(user.uid, (newFiles) => {
          setFiles(newFiles);
        });

        return () => {
          unsubscribeFiles();
        };
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const sizes = files?.reduce((sum, file) => sum + file.data.size, 0);
    setSize(sizes);
    const storageSize = changeBytes(sizes);
    setStorage(storageSize);
  }, [files]);

  const storagePercent = Math.min((size / 15000000000) * 100, 100);

  return (
    <>
      <SidebarOptions>
        <NavLink to={"/home"}>
          {({ isActive }) => (
            <SidebarOption title="My Drive" $isActive={isActive}>
              <ActiveIndicator $isActive={isActive} />
              <MobileScreenShareIcon />
              <span>My Drive</span>
            </SidebarOption>
          )}
        </NavLink>

        <NavLink to={"/recent"}>
          {({ isActive }) => (
            <SidebarOption title="Recent" $isActive={isActive}>
              <ActiveIndicator $isActive={isActive} />
              <QueryBuilderIcon />
              <span>Recent</span>
            </SidebarOption>
          )}
        </NavLink>

        <NavLink to={"/starred"}>
          {({ isActive }) => (
            <SidebarOption title="Starred" $isActive={isActive}>
              <ActiveIndicator $isActive={isActive} />
              <StarBorderIcon />
              <span>Starred</span>
            </SidebarOption>
          )}
        </NavLink>

        <NavLink to={"/trash"}>
          {({ isActive }) => (
            <SidebarOption title="Trash" $isActive={isActive}>
              <ActiveIndicator $isActive={isActive} />
              <DeleteOutlineIcon />
              <span>Trash</span>
            </SidebarOption>
          )}
        </NavLink>

        <Divider />

        <SidebarOption
          title="Help"
          onClick={() => dispatch(setHelpModal(true))}
        >
          <HelpIcon />
          <span>Help</span>
        </SidebarOption>

        <SidebarOption
          title={`${storage} of 2 TB used`}
          onClick={() => setOpenStorageModal(true)}
        >
          <CloudQueueIcons />
          <span>Storage</span>
        </SidebarOption>
      </SidebarOptions>

      <HelpModal
        openHelp={openHelp}
        closeHelpModal={() => dispatch(setHelpModal(false))}
      />

      <Modal open={openStorageModal} onClose={() => setOpenStorageModal(false)}>
        <ModalPopup>
          <CloseButton onClick={() => setOpenStorageModal(false)}>
            <Lottie
              loop
              animationData={closeJson}
              play
              style={{ width: 36, height: 36 }}
            />
          </CloseButton>

          <ModalHeader>
            <ModalIcon>☁️</ModalIcon>
            <h3>Cloud Storage</h3>
            <p>Your secure encrypted storage</p>
          </ModalHeader>

          <ModalBody>
            <StorageVisual>
              <StorageRing $percent={storagePercent}>
                <div className="inner">
                  <span className="percent">{storagePercent.toFixed(1)}%</span>
                  <span className="label">used</span>
                </div>
              </StorageRing>
            </StorageVisual>

            <StorageStats>
              <StatCard>
                <span className="icon">📁</span>
                <span className="value">{files.length}</span>
                <span className="label">Total Files</span>
              </StatCard>
              <StatCard>
                <span className="icon">🔒</span>
                <span className="value">{files.filter(f => f.data?.isEncrypted || f.data?.crypto).length}</span>
                <span className="label">Encrypted</span>
              </StatCard>
            </StorageStats>

            <StorageInfo>
              <div className="used">
                <span className="dot" />
                <span>{storage} used</span>
              </div>
              <div className="total">
                <span className="dot available" />
                <span>2 TB total</span>
              </div>
            </StorageInfo>

            <ProgressWrapper>
              <ProgressBar $percent={storagePercent} />
            </ProgressWrapper>

            <StorageNote>
              💡 All files are encrypted with AES-256
            </StorageNote>
          </ModalBody>
        </ModalPopup>
      </Modal>
    </>
  );
};

export default SidebarTabs;

/* ================= ANIMATIONS ================= */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

/* ================= STYLES ================= */

const SidebarOptions = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 8px;

  a {
    text-decoration: none;
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(180deg, #0ea5e9, #8b5cf6);
  opacity: ${props => props.$isActive ? 1 : 0};
  transform-origin: left;
  animation: ${props => props.$isActive ? slideIn : 'none'} 0.3s ease;
`;

const SidebarOption = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  margin-left: 4px;
  border-radius: 0 24px 24px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$isActive ? 'var(--gradient-glow)' : 'transparent'};

  svg.MuiSvgIcon-root {
    color: ${props => props.$isActive ? 'var(--primary)' : 'var(--text-muted)'};
    font-size: 20px;
    transition: all 0.2s ease;
  }

  span {
    margin-left: 14px;
    font-size: 14px;
    font-weight: ${props => props.$isActive ? '600' : '500'};
    color: ${props => props.$isActive ? 'var(--primary)' : 'var(--text-muted)'};
    transition: all 0.2s ease;

    @media screen and (max-width: 768px) {
      display: none;
    }
  }

  &:hover {
    background: var(--bg-tertiary);

    svg.MuiSvgIcon-root {
      color: var(--primary);
      transform: scale(1.1);
    }

    span {
      color: var(--text);
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  margin: 12px 16px;
`;

const ModalPopup = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  width: 100%;
  max-width: 380px;
  padding: 28px;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
  animation: ${fadeIn} 0.3s ease;
`;

const CloseButton = styled.span`
  position: absolute;
  right: 12px;
  top: 12px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }
`;

const ModalIcon = styled.div`
  font-size: 40px;
  margin-bottom: 8px;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const StorageVisual = styled.div`
  display: flex;
  justify-content: center;
`;

const StorageRing = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #0ea5e9 0%,
    #8b5cf6 ${props => props.$percent * 0.5}%,
    #f472b6 ${props => props.$percent}%,
    var(--bg-tertiary) ${props => props.$percent}%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .inner {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: var(--bg-secondary);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .percent {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
  }
`;

const StorageInfo = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;

  > div {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  }

  .dot.available {
    background: var(--bg-tertiary);
  }
`;

const ProgressWrapper = styled.div`
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${props => props.$percent}%;
  background: linear-gradient(90deg, #0ea5e9, #8b5cf6, #f472b6);
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const StorageStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  width: 100%;
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  border: 1px solid var(--border);
  min-width: 90px;

  .icon {
    font-size: 20px;
    margin-bottom: 4px;
  }

  .value {
    font-size: 1.25rem;
    font-weight: 700;
    background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .label {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 2px;
  }
`;

const StorageNote = styled.div`
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  padding: 12px 16px;
  background: rgba(14, 165, 233, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(14, 165, 233, 0.2);
`;
