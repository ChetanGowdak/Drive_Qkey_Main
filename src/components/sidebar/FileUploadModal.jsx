import styled, { keyframes } from "styled-components";
import { Modal } from "@mui/material";
import Lottie from "react-lottie-player";
import uploadJson from "../lottie/uploadLottie.json";
import closeJson from "../lottie/closeLottie.json";
import { UploadFileIcon } from "../common/SvgIcons";

const FileUploadModal = ({
  open,
  setOpen,
  handleUpload,
  uploading,
  handleFile,
  selectedFile,
  progress,
}) => {
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      disableEnforceFocus
      disableAutoFocus
    >
      <ModalPopup>
        <CloseButton onClick={() => setOpen(false)}>
          <Lottie
            loop
            animationData={closeJson}
            play
            style={{ width: 36, height: 36 }}
          />
        </CloseButton>

        <form onSubmit={handleUpload}>
          <ModalHeader>
            <UploadIcon>📁</UploadIcon>
            <h3>{uploading ? "Uploading..." : "Upload File"}</h3>
            <p>Select a file to securely encrypt and upload</p>
          </ModalHeader>

          <ModalBody>
            {uploading ? (
              <>
                <UploadingContainer>
                  <Lottie
                    loop
                    animationData={uploadJson}
                    play
                    style={{ width: 100, height: 70 }}
                  />
                </UploadingContainer>
                <ProgressWrapper>
                  <ProgressBar $progress={progress} />
                  <ProgressText>{progress}%</ProgressText>
                </ProgressWrapper>
              </>
            ) : (
              <>
                <DropZone>
                  <DropZoneContent>
                    <p className="filename">
                      {selectedFile || "No file chosen"}
                    </p>
                    <label htmlFor="file">
                      <UploadFileIcon />
                      <span>Choose File</span>
                    </label>
                    <input id="file" type="file" onChange={handleFile} />
                  </DropZoneContent>
                </DropZone>
                <SubmitButton type="submit" disabled={!selectedFile}>
                  <span>Encrypt & Upload</span>
                  <ShimmerOverlay />
                </SubmitButton>
              </>
            )}
          </ModalBody>
        </form>
      </ModalPopup>
    </Modal>
  );
};

export default FileUploadModal;

/* ================= ANIMATIONS ================= */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const shimmer = keyframes`
  0% { left: -100%; }
  100% { left: 100%; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

/* ================= STYLES ================= */

const ModalPopup = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  width: 100%;
  max-width: 420px;
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
  z-index: 10;

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
    margin: 8px 0 4px;
  }

  p {
    font-size: 13px;
    color: var(--text-muted);
  }
`;

const UploadIcon = styled.div`
  font-size: 40px;
  margin-bottom: 4px;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DropZone = styled.div`
  border: 2px dashed var(--primary);
  border-radius: 16px;
  padding: 24px;
  background: rgba(14, 165, 233, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(14, 165, 233, 0.1);
    border-color: var(--accent);
  }
`;

const DropZoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .filename {
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg-secondary);
    color: var(--text);
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      font-size: 18px;
      color: var(--primary);
    }

    &:hover {
      background: var(--bg-tertiary);
      border-color: var(--primary);
    }
  }

  input {
    display: none;
  }
`;

const SubmitButton = styled.button`
  position: relative;
  width: 100%;
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #f472b6 100%);
  background-size: 200% 200%;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s ease;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);

  span {
    position: relative;
    z-index: 1;
  }

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

const UploadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
`;

const ProgressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #0ea5e9, #8b5cf6, #f472b6);
    width: ${(props) => props.$progress}%;
    transition: width 0.4s ease;
    border-radius: 4px;
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
`;

const ProgressText = styled.p`
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;
