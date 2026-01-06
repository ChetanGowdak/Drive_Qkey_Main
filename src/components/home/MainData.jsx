// ✅ Premium MainData - Glassmorphic Design with Animations
import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  ArrowDownIcon,
  MoreOptionsIcon,
  StarFilledIcon,
  StarBorderIcon,
  DownloadIcon,
  CopyIcon,
  DeleteIcon,
  ShareIcon,
} from "../common/SvgIcons";
import { changeBytes, convertDates } from "../common/common";
import FileIcons from "../common/FileIcons";
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookIcon,
  LinkedinIcon,
  WhatsappIcon,
} from "react-share";
import { handleStarred } from "../common/firebaseApi";
import { toast } from "react-toastify";
import LottieImage from "../common/LottieImage";
import PasswordModal from "../common/PasswordModal";

// 🔐 cloudinary + crypto
import { downloadFromCloudinary } from "../common/cloudinaryApi";
import { decryptBytes } from "../utils/crypto";

const MainData = ({ files, handleOptionsClick, optionsVisible, handleDelete }) => {
  const [showShareIcons, setShowShareIcons] = useState(null);

  // 🔐 password modal state
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState("");
  const [modalMode, setModalMode] = useState("download"); // "download" | "share"

  // ✅ Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        !e.target.closest(".options-menu") &&
        !e.target.closest(".options-trigger")
      ) {
        handleOptionsClick(null);
        setShowShareIcons(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleOptionsClick]);

  // 🔐 Open password modal for download
  const openDownloadModal = (file) => {
    setSelectedFile(file);
    setModalMode("download");
    setDecryptError("");
    setShowPassword(true);
  };

  // 🔗 Open password modal for share link
  const openShareLinkModal = (file) => {
    setSelectedFile(file);
    setModalMode("share");
    setDecryptError("");
    setShowPassword(true);
  };

  // 🔐 Handle password submission
  const handlePasswordSubmit = async (password) => {
    if (!password || !selectedFile) return;

    setIsDecrypting(true);
    setDecryptError("");

    try {
      if (modalMode === "download") {
        const fileURL = selectedFile.data?.fileURL;
        if (!fileURL) {
          throw new Error("Missing URL to encrypted file.");
        }

        const encryptedBytes = await downloadFromCloudinary(fileURL);

        const plainBytes = await decryptBytes(
          new Uint8Array(encryptedBytes),
          selectedFile.data.crypto,
          password
        );

        const blob = new Blob([plainBytes], {
          type: selectedFile.data.originalType || "application/octet-stream",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = selectedFile.data.filename || "file";
        a.click();
        URL.revokeObjectURL(url);

        toast.success("File decrypted & downloaded! ✅");
      } else {
        const response = await fetch("/.netlify/functions/decrypt-share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileURL: selectedFile.data.fileURL,
            cryptoMeta: {
              ...selectedFile.data.crypto,
              originalType: selectedFile.data.originalType
            },
            password: password,
            filename: selectedFile.data.filename
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to create share link");
        }

        await navigator.clipboard.writeText(result.shareURL);
        toast.success("Share link copied to clipboard! 📋");
      }

      setShowPassword(false);
      setSelectedFile(null);
    } catch (err) {
      console.error("❌ Error:", err);
      toast.error(err.message || "Wrong password or failed");
      // setDecryptError(err.message || "Wrong password or failed");
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <>
      {files.length > 0 && (
        <DataListHeader>
          <div className="name-col">
            <ArrowDownIcon />
            <b>Name</b>
          </div>
          <div className="size-col">
            <b>Size</b>
          </div>
          <div className="date-col">
            <b>Modified</b>
          </div>
          <div className="actions-col">
            <b>Actions</b>
          </div>
        </DataListHeader>
      )}

      {files.length > 0 ? (
        <FileListContainer>
          {files.map((file, index) => (
            <DataListRow key={file.id} style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="name-col">
                <StarButton onClick={() => handleStarred(file.id)}>
                  {file.data.starred ? <StarFilledIcon /> : <StarBorderIcon />}
                </StarButton>

                {file.data.isEncrypted ? (
                  <FileInfo>
                    <FileIcons type={file.data.originalType || file.data.contentType} />
                    <span className="filename">
                      <LockBadge>🔒</LockBadge>
                      {file.data.filename}
                    </span>
                  </FileInfo>
                ) : (
                  <FileLink href={file.data.fileURL} target="_blank" rel="noopener noreferrer">
                    <FileIcons type={file.data.contentType} />
                    <span className="filename">{file.data.filename}</span>
                  </FileLink>
                )}
              </div>

              <div className="size-col">
                {changeBytes(file.data.size)}
              </div>
              <div className="date-col">
                {convertDates(file.data.timestamp?.seconds)}
              </div>

              <div className="actions-col">
                <OptionsTrigger
                  className="options-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionsClick(file.id === optionsVisible ? null : file.id);
                  }}
                >
                  <MoreOptionsIcon />
                </OptionsTrigger>

                {optionsVisible === file.id && (
                  <OptionsMenu className="options-menu">
                    <MenuArrow />

                    {file.data.isEncrypted ? (
                      <MenuItem onClick={() => openDownloadModal(file)}>
                        <DownloadIcon /> Download
                      </MenuItem>
                    ) : (
                      <MenuItem as="a" href={file.data.fileURL} download target="_blank">
                        <DownloadIcon /> Download
                      </MenuItem>
                    )}

                    <MenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(file.data.fileURL);
                        toast.success("Link Copied");
                      }}
                    >
                      <CopyIcon /> Copy Link
                    </MenuItem>

                    {(file.data.isEncrypted || file.data.crypto) && (
                      <MenuItem onClick={() => openShareLinkModal(file)}>
                        <ShareIcon /> Share Link
                      </MenuItem>
                    )}

                    <div style={{ position: "relative" }}>
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowShareIcons(showShareIcons === file.id ? null : file.id);
                        }}
                      >
                        <ShareIcon /> Social Share
                      </MenuItem>

                      {showShareIcons === file.id && (
                        <SharePopover>
                          <EmailShareButton url={file.data.fileURL}>
                            <EmailIcon size={32} round />
                          </EmailShareButton>
                          <FacebookShareButton url={file.data.fileURL}>
                            <FacebookIcon size={32} round />
                          </FacebookShareButton>
                          <LinkedinShareButton url={file.data.fileURL}>
                            <LinkedinIcon size={32} round />
                          </LinkedinShareButton>
                          <WhatsappShareButton url={file.data.fileURL}>
                            <WhatsappIcon size={32} round />
                          </WhatsappShareButton>
                        </SharePopover>
                      )}
                    </div>

                    <MenuDivider />

                    <MenuItem className="delete" onClick={() => handleDelete(file.id, file.data)}>
                      <DeleteIcon /> Delete
                    </MenuItem>

                    <MenuDivider />

                    <MetaInfo>
                      <span>📅 {convertDates(file.data.timestamp?.seconds)}</span>
                      <span>📦 {changeBytes(file.data.size)}</span>
                    </MetaInfo>
                  </OptionsMenu>
                )}
              </div>
            </DataListRow>
          ))}
        </FileListContainer>
      ) : (
        <LottieImage
          imagePath={"/homePage.svg"}
          text1={"A place for all of your files"}
          text2={"Use the 'New' button to upload"}
        />
      )}

      {/* 🔐 Password Modal */}
      {showPassword && selectedFile && (
        <PasswordModal
          title={modalMode === "download" ? "Decrypt & Download" : "Get Share Link"}
          subtitle={`Enter password for "${selectedFile.data.filename}"`}
          onSubmit={handlePasswordSubmit}
          onCancel={() => {
            setShowPassword(false);
            setSelectedFile(null);
            setDecryptError("");
          }}
          loading={isDecrypting}
          error={decryptError}
          isShareMode={modalMode === "share"}
        />
      )}
    </>
  );
};

export default MainData;

/* ================= ANIMATIONS ================= */

const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const fadeInScale = keyframes`
  from { 
    opacity: 0; 
    transform: scale(0.95) translateX(10px); 
  }
  to { 
    opacity: 1; 
    transform: scale(1) translateX(0); 
  }
`;

const starPop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

/* ================= STYLES ================= */

const DataListHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 0.8fr 1fr 0.5fr;
  width: 100%;
  padding: 12px 20px;
  align-items: center;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  .name-col {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media screen and (max-width: 768px) {
    grid-template-columns: 2fr 1fr 0.8fr;
    .date-col { display: none; }
  }

  @media screen and (max-width: 480px) {
    grid-template-columns: 2fr 0.8fr;
    .size-col, .date-col { display: none; }
  }
`;

const FileListContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const DataListRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 0.8fr 1fr 0.5fr;
  width: 100%;
  padding: 14px 20px;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
  font-size: 14px;
  transition: all 0.2s ease;
  animation: ${fadeInUp} 0.4s ease forwards;
  opacity: 0;
  position: relative;
  z-index: 1;

  &:hover {
    background: var(--bg-tertiary);
  }

  /* When this row has an open dropdown, keep it on top */
  &:has(.options-menu) {
    z-index: 100;
  }

  .name-col {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .size-col, .date-col {
    color: var(--text-muted);
    font-size: 13px;
  }

  .actions-col {
    position: relative;
    display: flex;
    justify-content: center;
    z-index: 10;
  }

  @media screen and (max-width: 768px) {
    grid-template-columns: 2fr 1fr 0.8fr;
    .date-col { display: none; }
  }

  @media screen and (max-width: 480px) {
    grid-template-columns: 2fr 0.8fr;
    .size-col, .date-col { display: none; }
  }
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;

  svg {
    font-size: 20px;
    color: var(--text-muted);
    transition: all 0.2s ease;
  }

  &:hover svg {
    color: #fbbf24;
    animation: ${starPop} 0.3s ease;
  }

  svg[data-filled="true"] {
    color: #fbbf24;
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  .filename {
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 280px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text);
    font-weight: 500;
  }
`;

const FileLink = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: var(--text);
  transition: color 0.2s ease;

  .filename {
    max-width: 280px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }

  &:hover {
    color: var(--primary);
  }
`;

const LockBadge = styled.span`
  font-size: 14px;
`;

const OptionsTrigger = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  transition: all 0.2s ease;

  svg {
    font-size: 20px;
    color: var(--text-muted);
    transition: all 0.2s ease;
  }

  &:hover {
    background: var(--gradient-glow);
    
    svg {
      color: var(--primary);
    }
  }
`;

const OptionsMenu = styled.div`
  position: absolute;
  top: -10px;
  right: calc(60% + 4px);
  min-width: 200px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  padding: 8px;
  z-index: 1000;
  animation: ${fadeInScale} 0.2s ease;
`;

const MenuArrow = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--glass-bg);
  border-right: 1px solid var(--glass-border);
  border-top: 1px solid var(--glass-border);
  transform: rotate(45deg);
  top: 24px;
  right: -7px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  transition: all 0.2s ease;
  text-decoration: none;

  svg {
    font-size: 18px;
    color: var(--text-muted);
    transition: color 0.2s ease;
  }

  &:hover {
    background: var(--gradient-glow);
    transform: translateX(4px);

    svg {
      color: var(--primary);
    }
  }

  &.delete {
    color: var(--error);

    svg {
      color: var(--error);
    }

    &:hover {
      background: rgba(239, 68, 68, 0.1);
    }
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  margin: 8px 0;
`;

const MetaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 14px;
  font-size: 12px;
  color: var(--text-muted);
  pointer-events: none;
`;

const SharePopover = styled.div`
  position: absolute;
  right: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  z-index: 20;
  animation: none; /* Removed animation to avoid conflict with transform */

  /* Little arrow pointing to the menu */
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    right: -6px;
    transform: translateY(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: var(--glass-bg);
    border-right: 1px solid var(--glass-border);
    border-top: 1px solid var(--glass-border);
  }
`;
