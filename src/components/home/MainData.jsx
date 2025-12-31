// ✅ FINAL LOCKED MAIN DATA — GOOGLE DRIVE STYLE (220px, fade, arrow, no push layout, meta inside)
import React, { useState, useEffect } from "react";
import styled from "styled-components";
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

  // 🔐 Decrypt AFTER password entered
  const handleDecryptConfirm = async (password) => {
    try {
      setShowPassword(false);
      if (!password || !selectedFile) return;

      const fileURL = selectedFile.data?.fileURL;
      if (!fileURL) {
        alert("❌ Missing URL to encrypted file.");
        return;
      }

      // Download from Cloudinary
      const encryptedBytes = await downloadFromCloudinary(fileURL);

      const plainBytes = await decryptBytes(
        new Uint8Array(encryptedBytes),
        selectedFile.data.crypto,  // meta (crypto object)
        password                    // passphrase
      );

      const blob = new Blob([plainBytes], {
        type:
          selectedFile.data.originalType || "application/octet-stream",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedFile.data.filename || "file";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Decryption failed:", err);
      alert("❌ Wrong password or corrupted file.");
    }
  };

  return (
    <>
      {files.length > 0 && (
        <DataListRow>
          <div>
            <b>
              <ArrowDownIcon /> Name
            </b>
          </div>
          <div className="fileSize">
            <b>File Size</b>
          </div>
          <div className="modified">
            <b>Last Modified</b>
          </div>
          <div>
            <b>Options</b>
          </div>
        </DataListRow>
      )}

      {files.length > 0 ? (
        files.map((file) => (
          <DataListRow key={file.id}>
            <div>
              <p className="starr" onClick={() => handleStarred(file.id)}>
                {file.data.starred ? <StarFilledIcon /> : <StarBorderIcon />}
              </p>

              {file.data.isEncrypted ? (
                <>
                  <FileIcons
                    type={
                      file.data.originalType || file.data.contentType
                    }
                  />
                  <span>🔒 {file.data.filename}</span>
                </>
              ) : (
                <a
                  href={file.data.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileIcons type={file.data.contentType} />
                  <span>{file.data.filename}</span>
                </a>
              )}
            </div>

            <div className="fileSize">
              {changeBytes(file.data.size)}
            </div>
            <div className="modified">
              {convertDates(file.data.timestamp?.seconds)}
            </div>

            <div style={{ position: "relative" }}>
              <OptionsTrigger
                className="options-trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionsClick(
                    file.id === optionsVisible ? null : file.id
                  );
                }}
              >
                <MoreOptionsIcon />
              </OptionsTrigger>

              {optionsVisible === file.id && (
                <OptionsMenu className="options-menu">
                  {file.data.isEncrypted ? (
                    <MenuItem
                      onClick={() => {
                        setSelectedFile(file);
                        setShowPassword(true);
                      }}
                    >
                      <DownloadIcon /> Decrypt & Download
                    </MenuItem>
                  ) : (
                    <MenuItem
                      as="a"
                      href={file.data.fileURL}
                      download
                      target="_blank"
                    >
                      <DownloadIcon /> Download
                    </MenuItem>
                  )}

                  <MenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(
                        file.data.fileURL
                      );
                      toast.success("Link Copied");
                    }}
                  >
                    <CopyIcon /> Copy Link
                  </MenuItem>

                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShareIcons(
                        showShareIcons === file.id ? null : file.id
                      );
                    }}
                  >
                    <ShareIcon /> Share
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

                  <MenuItem
                    className="delete"
                    onClick={() =>
                      handleDelete(file.id, file.data)
                    }
                  >
                    <DeleteIcon /> Delete
                  </MenuItem>

                  <Meta>
                    📅{" "}
                    {convertDates(file.data.timestamp?.seconds)}
                  </Meta>
                  <Meta>📦 {changeBytes(file.data.size)}</Meta>
                </OptionsMenu>
              )}
            </div>
          </DataListRow>
        ))
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
          onSubmit={handleDecryptConfirm}
          onCancel={() => {
            setShowPassword(false);
            setSelectedFile(null);
          }}
        />
      )}
    </>
  );
};

export default MainData;

/* ✅ STYLES  */
const DataListRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 0.8fr 1fr 0.5fr;
  width: 100%;
  padding: 10px 16px;
  align-items: center;
  border-bottom: 1px solid var(--border);
  font-size: 14px;

  div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .starr {
    margin-right: 6px;
  }

  a span {
    display: inline-block;
    max-width: 260px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media screen and (max-width: 768px) {
    grid-template-columns: 2fr 1fr 0.8fr;
    .modified { display: none; }
  }

  @media screen and (max-width: 480px) {
    grid-template-columns: 2fr 0.8fr;
    .fileSize, .modified { display: none; }
  }
`;

const OptionsTrigger = styled.span`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  svg {
    font-size: 28px;
    padding: 6px;
    border-radius: 50%;
    transition: background 0.15s ease;
  }
  svg:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

const OptionsMenu = styled.span`
  display: flex;
  align-items: center;
  flex-direction: column;
  position: absolute;
  background-color: #fff;
  border: 2px solid #ccc;
  top: -200%;
  right: 100%;
  cursor: pointer;
  z-index: 10;
  width: max-content;
  min-width: 120px;
  border-radius: 10px;

  /* 🌙 DARK MODE */
  body.dark-mode & {
    background-color: #2b2c2f;
    border: 2px solid #3d3e42;
  }

  &::before {
    content: "";
    position: absolute;
    width: 15px;
    height: 15px;
    background-color: #fff;
    top: 100px;
    right: -8px;
    transform: rotate(45deg);
    border-right: 1px solid #ccc;
    border-top: 1px solid #ccc;

    /* 🌙 DARK MODE ARROW */
    body.dark-mode & {
      background-color: #2b2c2f;
      border-right: 1px solid #3d3e42;
      border-top: 1px solid #3d3e42;
    }
  }

  span {
    width: 100%;
    border-bottom: 2px solid #ccc;
    padding: 10px;
    display: flex;
    align-items: center;

    /* 🌙 DARK MODE BORDER */
    body.dark-mode & {
      border-bottom: 2px solid #3d3e42;
    }

    a {
      color: #000;

      /* 🌙 DARK MODE TEXT */
      body.dark-mode & {
        color: #e5e7eb;
      }
    }

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #ccc;
      z-index: 11;

      /* 🌙 DARK MODE HOVER */
      body.dark-mode & {
        background-color: #3a3b3f;
      }
    }
  }

  button {
    background-color: transparent;
    border: none;
    color: red;
    display: flex;
    align-items: center;
    justify-content: center;

    /* 🌙 DARK MODE RED */
    body.dark-mode & {
      color: #ff6b6b;
    }
  }

  a {
    color: #000;
    background-color: transparent;

    /* 🌙 DARK MODE TEXT */
    body.dark-mode & {
      color: #e5e7eb;
    }
  }

  .fileSize,
  .uploaded {
    background-color: #f0f0f0;
    cursor: default;

    /* 🌙 DARK MODE META BACKGROUND */
    body.dark-mode & {
      background-color: #2b2c2f;
      color: #cfcfcf;
    }
  }
`;

const MenuItem = styled.div`
  padding: 12px 14px;
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
  font-size: 15px;
  cursor: pointer;
  svg { font-size: 18px; }
  &:hover { background: var(--menu-hover); }
  &.delete { color: #e63946 !important; }
`;

const Meta = styled.div`
  padding: 10px 14px;
  font-size: 13px;
  opacity: 0.7;
  pointer-events: none;
`;

const SharePopover = styled.div`
  position: absolute;
  top: 0;
  right: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: var(--menu-bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: var(--shadow);
  pointer-events: auto;
  z-index: 9999;
`;
