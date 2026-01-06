import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import FileIcons from "./FileIcons";
import { changeBytes, convertDates } from "./common";
import LottieImage from "./LottieImage";
import PasswordModal from "./PasswordModal";

// cloudinary + crypto
import { downloadFromCloudinary } from "./cloudinaryApi";
import { decryptBytes } from "../utils/crypto";

const FilesList = ({ data = [], imagePath, text1, text2 }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    setShowPassword(false);
    setSelectedFile(null);
  }, [data]);

  const handleDecryptConfirm = async (password) => {
    try {
      setShowPassword(false);
      if (!password || !selectedFile) return;

      const fileURL = selectedFile.data?.fileURL;
      if (!fileURL) return alert("Missing encrypted file URL");

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
      a.download = selectedFile.data.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Wrong password or corrupted file");
    }
  };

  if (!data || data.length === 0) {
    return (
      <EmptyState>
        <LottieImage imagePath={imagePath} text1={text1} text2={text2} />
      </EmptyState>
    );
  }

  return (
    <>
      <Grid>
        {data.map((file, index) => (
          <Card key={file.id} style={{ animationDelay: `${index * 0.05}s` }}>
            <IconWrap $type={file.data.originalType || file.data.contentType}>
              <FileIcons type={file.data.originalType || file.data.contentType} />
              {file.data.isEncrypted && <LockBadge>🔐</LockBadge>}
            </IconWrap>

            <Info>
              <Title title={file.data.filename}>
                {file.data.filename}
              </Title>

              <Meta>
                <span>{changeBytes(file.data.size)}</span>
                <span>•</span>
                <span>{convertDates(file.data.timestamp?.seconds)}</span>
              </Meta>

              {file.data.isEncrypted ? (
                <ActionButton
                  onClick={() => {
                    setSelectedFile(file);
                    setShowPassword(true);
                  }}
                >
                  🔐 Decrypt & Download
                </ActionButton>
              ) : (
                <ActionLink
                  href={file.data.fileURL}
                  target="_blank"
                  rel="noreferrer"
                >
                  📥 Download
                </ActionLink>
              )}
            </Info>
          </Card>
        ))}
      </Grid>

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

export default FilesList;

// Get gradient based on file type
const getFileGradient = (type = "") => {
  if (type.includes("image")) return "linear-gradient(135deg, #10b981, #34d399)";
  if (type.includes("pdf")) return "linear-gradient(135deg, #ef4444, #f87171)";
  if (type.includes("video")) return "linear-gradient(135deg, #f59e0b, #fbbf24)";
  if (type.includes("audio")) return "linear-gradient(135deg, #8b5cf6, #a78bfa)";
  if (type.includes("zip") || type.includes("rar")) return "linear-gradient(135deg, #eab308, #facc15)";
  if (type.includes("doc") || type.includes("word")) return "linear-gradient(135deg, #3b82f6, #60a5fa)";
  return "linear-gradient(135deg, #6b7280, #9ca3af)";
};

/* ================= ANIMATIONS ================= */

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ================= STYLES ================= */

const EmptyState = styled.div`
  width: 100%;
  padding: 20px;
`;

const Grid = styled.div`
  width: 100%;
  display: grid;
  gap: 14px;
  padding: 20px 0;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(200px, 1fr));
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  transition: all 0.25s ease;
  animation: ${fadeInUp} 0.4s ease forwards;
  opacity: 0;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary);
    transform: translateY(-3px);
  }
`;

const IconWrap = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => getFileGradient(props.$type)};
  flex-shrink: 0;

  svg {
    font-size: 24px;
    color: white;
  }
`;

const LockBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  font-size: 12px;
  background: var(--bg-secondary);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.div`
  display: flex;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
`;

const ActionButton = styled.button`
  margin-top: 4px;
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  color: white;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  }
`;

const ActionLink = styled.a`
  margin-top: 4px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  text-decoration: none;
  color: var(--text);
  font-weight: 600;
  font-size: 12px;
  width: fit-content;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary);
  }
`;
