import React, { useState, useEffect } from "react";
import styled from "styled-components";
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

  // reset modal when section changes (Starred / Recent / Drive)
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
        {data.map((file) => (
          <Card key={file.id}>
            <IconWrap>
              <FileIcons
                type={file.data.originalType || file.data.contentType}
              />
            </IconWrap>

            <Info>
              <Title title={file.data.filename}>
                {file.data.isEncrypted
                  ? `🔒 ${file.data.filename}`
                  : file.data.filename}
              </Title>

              <Meta>
                <span>{changeBytes(file.data.size)}</span>
                <span>•</span>
                <span>
                  {convertDates(file.data.timestamp?.seconds)}
                </span>
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
                  Download
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

/* ================= STYLES ================= */

const EmptyState = styled.div`
  width: 100%;
`;

const Grid = styled.div`
  width: 100%;
  display: grid;
  gap: 14px;
  padding: 10px 0;
  grid-template-columns: repeat(4, minmax(220px, 1fr));

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(200px, 1fr));
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  gap: 10px;
  background: #fff;

  body.dark-mode & {
    background: #1f1f1f;
    border-color: #2e2e2e;
  }
`;

const IconWrap = styled.div`
  svg {
    color: #6b7280;
  }

  body.dark-mode & svg {
    color: #d1d5db;
  }
`;

const Info = styled.div`
  display: grid;
  gap: 6px;
`;

const Title = styled.div`
  font-weight: 600;
  color: #111827;

  body.dark-mode & {
    color: #e5e7eb;
  }
`;

const Meta = styled.div`
  font-size: 12px;
  color: #6b7280;

  body.dark-mode & {
    color: #9ca3af;
  }
`;

const ActionButton = styled.button`
  margin-top: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  cursor: pointer;

  body.dark-mode & {
    background: #2a2a2a;
    border-color: #3a3a3a;
    color: #e5e7eb;
  }
`;

const ActionLink = styled.a`
  margin-top: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  text-decoration: none;
  color: #111827;

  body.dark-mode & {
    background: #2a2a2a;
    border-color: #3a3a3a;
    color: #e5e7eb;
  }
`;
