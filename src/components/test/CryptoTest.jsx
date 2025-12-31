// src/components/test/CryptoTest.jsx
// Local testing page for password-protected encryption/decryption
// Uses the same UI components and styling as the Drive clone

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Modal } from "@mui/material";
import Lottie from "react-lottie-player";
import uploadJson from "../lottie/uploadLottie.json";
import closeJson from "../lottie/closeLottie.json";
import { encryptFile, decryptBytes } from "../utils/crypto";
import { toast, ToastContainer } from "react-toastify";
import { UploadFileIcon, DownloadIcon } from "../common/SvgIcons";
import FileIcons from "../common/FileIcons";
import PasswordModal from "../common/PasswordModal";
import "react-toastify/dist/ReactToastify.css";

const CryptoTest = () => {
    // Dark mode state
    const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

    useEffect(() => {
        document.body.classList.toggle("dark-mode", isDark);
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);

    // Upload modal state
    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [encrypting, setEncrypting] = useState(false);
    const [progress, setProgress] = useState(0);

    // Password modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordAction, setPasswordAction] = useState(null); // 'encrypt' or 'decrypt'
    const [fileToDecrypt, setFileToDecrypt] = useState(null);

    // Encrypted files storage (simulating cloud)
    const [encryptedFiles, setEncryptedFiles] = useState([]);

    // Test results
    const [testResults, setTestResults] = useState([]);

    const addResult = (message, success = true) => {
        setTestResults((prev) => [
            ...prev,
            { message, success, time: new Date().toLocaleTimeString() },
        ]);
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setSelectedFileName(e.target.files[0].name);
        }
    };

    // Open password modal for encryption
    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please select a file first");
            return;
        }
        setPasswordAction("encrypt");
        setShowPasswordModal(true);
    };

    // Encrypt with password
    const handleEncryptWithPassword = async (password) => {
        setShowPasswordModal(false);
        if (!password || !selectedFile) {
            toast.warn("Upload cancelled");
            return;
        }

        setEncrypting(true);
        setProgress(0);
        addResult(`🔐 Starting encryption of "${selectedFile.name}"...`);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90));
            }, 100);

            const startTime = performance.now();
            const { encryptedBlob, meta } = await encryptFile(selectedFile, password);
            const endTime = performance.now();

            clearInterval(progressInterval);
            setProgress(100);

            // Store encrypted data locally (simulating Firebase)
            const encryptedBytes = await encryptedBlob.arrayBuffer();
            const newFile = {
                id: Date.now().toString(),
                data: {
                    filename: meta.originalName,
                    size: meta.originalSize,
                    originalType: meta.originalType,
                    contentType: meta.originalType,
                    isEncrypted: true,
                    crypto: meta,
                    timestamp: { seconds: Math.floor(Date.now() / 1000) },
                    encryptedBytes: new Uint8Array(encryptedBytes),
                },
            };

            setEncryptedFiles((prev) => [...prev, newFile]);

            addResult(`✅ Encryption successful! (${(endTime - startTime).toFixed(0)}ms)`);
            addResult(`📊 Original: ${formatBytes(meta.originalSize)} → Encrypted: ${formatBytes(encryptedBytes.byteLength)}`);
            addResult(`🔑 Algorithm: ${meta.alg} | KDF: ${meta.kdf}`);

            toast.success("Encrypted upload complete ✅");
            setUploadOpen(false);
            setSelectedFile(null);
            setSelectedFileName("");
        } catch (err) {
            console.error(err);
            addResult(`❌ Encryption failed: ${err.message}`, false);
            toast.error("Encryption failed");
        }

        setEncrypting(false);
        setProgress(0);
    };

    // Open password modal for decryption
    const handleDecryptClick = (file) => {
        setFileToDecrypt(file);
        setPasswordAction("decrypt");
        setShowPasswordModal(true);
    };

    // Decrypt with password
    const handleDecryptWithPassword = async (password) => {
        setShowPasswordModal(false);
        if (!password || !fileToDecrypt) return;

        addResult(`🔓 Attempting decryption of "${fileToDecrypt.data.filename}"...`);

        try {
            const startTime = performance.now();
            const plainBytes = await decryptBytes(
                fileToDecrypt.data.encryptedBytes,
                fileToDecrypt.data.crypto,
                password
            );
            const endTime = performance.now();

            addResult(`✅ Decryption successful! (${(endTime - startTime).toFixed(0)}ms)`);

            // Download decrypted file
            const blob = new Blob([plainBytes], {
                type: fileToDecrypt.data.originalType || "application/octet-stream",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileToDecrypt.data.filename || "decrypted_file";
            a.click();
            URL.revokeObjectURL(url);

            addResult(`⬇️ Downloaded: ${fileToDecrypt.data.filename}`);
            toast.success("Decryption successful! File downloaded. ✅");
        } catch (err) {
            console.error(err);
            addResult(`❌ Decryption failed: ${err.message}`, false);
            toast.error("Wrong password or corrupted file!");
        }

        setFileToDecrypt(null);
    };

    // Test wrong password
    const testWrongPassword = async (file) => {
        addResult(`🧪 Testing WRONG password on "${file.data.filename}"...`);

        try {
            await decryptBytes(file.data.encryptedBytes, file.data.crypto, "wrong_password_12345");
            addResult(`❌ TEST FAILED: Wrong password should have been rejected!`, false);
        } catch (err) {
            addResult(`✅ TEST PASSED: Wrong password correctly rejected`);
            addResult(`   Error: "${err.message}"`);
            toast.success("Security test passed! ✅");
        }
    };

    // Download encrypted blob
    const downloadEncrypted = (file) => {
        const blob = new Blob([file.data.encryptedBytes], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.data.filename}.enc`;
        a.click();
        URL.revokeObjectURL(url);

        // Also save metadata
        const metaBlob = new Blob([JSON.stringify(file.data.crypto, null, 2)], { type: "application/json" });
        const metaUrl = URL.createObjectURL(metaBlob);
        const metaLink = document.createElement("a");
        metaLink.href = metaUrl;
        metaLink.download = `${file.data.filename}.meta.json`;
        setTimeout(() => metaLink.click(), 100);
        URL.revokeObjectURL(metaUrl);

        addResult(`⬇️ Downloaded encrypted file + metadata`);
        toast.success("Encrypted file downloaded!");
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={2000} theme={isDark ? "dark" : "light"} />

            {/* Header */}
            <HeaderContainer>
                <LogoSection>
                    <img
                        src="data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2236%22 height=%2236%22 viewBox=%220 0 36 36%22%3E%3Cpath fill=%22%2334A853%22 d=%22M16 16v14h4V20z%22/%3E%3Cpath fill=%22%234285F4%22 d=%22M30 16H20l-4 4h14z%22/%3E%3Cpath fill=%22%23FBBC05%22 d=%22M6 16v4h10l4-4z%22/%3E%3Cpath fill=%22%23EA4335%22 d=%22M20 16V6h-4v14z%22/%3E%3Cpath fill=%22none%22 d=%22M0 0h36v36H0z%22/%3E%3C/svg%3E"
                        alt="Drive"
                    />
                    <h2>🔐 Crypto Test Mode</h2>
                </LogoSection>
                <HeaderRight>
                    <TestBadge>Local Testing (No Firebase)</TestBadge>
                    <ThemeToggle onClick={() => setIsDark(!isDark)}>
                        {isDark ? "☀️" : "🌙"}
                    </ThemeToggle>
                    <BackButton href="/">← Back to Login</BackButton>
                </HeaderRight>
            </HeaderContainer>

            <HomeContainer>
                {/* Sidebar */}
                <SidebarContainer>
                    <SidebarBtn>
                        <button title="Upload & Encrypt" onClick={() => setUploadOpen(true)}>
                            <img
                                src="data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2236%22 height=%2236%22 viewBox=%220 0 36 36%22%3E%3Cpath fill=%22%2334A853%22 d=%22M16 16v14h4V20z%22/%3E%3Cpath fill=%22%234285F4%22 d=%22M30 16H20l-4 4h14z%22/%3E%3Cpath fill=%22%23FBBC05%22 d=%22M6 16v4h10l4-4z%22/%3E%3Cpath fill=%22%23EA4335%22 d=%22M20 16V6h-4v14z%22/%3E%3Cpath fill=%22none%22 d=%22M0 0h36v36H0z%22/%3E%3C/svg%3E"
                                alt="Add"
                            />
                            <span>New</span>
                        </button>
                    </SidebarBtn>

                    <SidebarInfo>
                        <h4>📋 Test Results</h4>
                        <ResultsList>
                            {testResults.length === 0 ? (
                                <EmptyResults>No tests run yet</EmptyResults>
                            ) : (
                                testResults.map((result, i) => (
                                    <ResultItem key={i} $success={result.success}>
                                        <span className="time">[{result.time}]</span>
                                        <span className="msg">{result.message}</span>
                                    </ResultItem>
                                ))
                            )}
                        </ResultsList>
                        {testResults.length > 0 && (
                            <ClearBtn onClick={() => setTestResults([])}>Clear Results</ClearBtn>
                        )}
                    </SidebarInfo>
                </SidebarContainer>

                {/* Main Content */}
                <DataContainer>
                    <PageHeader>
                        <h2>🔒 Password-Protected Files</h2>
                        <p>Upload files to test encryption • Decrypt to verify passwords work correctly</p>
                    </PageHeader>

                    {encryptedFiles.length === 0 ? (
                        <EmptyState>
                            <img src="/empty.svg" alt="No files" onError={(e) => e.target.style.display = 'none'} />
                            <p>No encrypted files yet</p>
                            <p className="sub">Click "New" to upload and encrypt a file</p>
                        </EmptyState>
                    ) : (
                        <FilesGrid>
                            {encryptedFiles.map((file) => (
                                <FileCard key={file.id}>
                                    <IconWrap>
                                        <FileIcons type={file.data.originalType || file.data.contentType} />
                                    </IconWrap>
                                    <FileInfo>
                                        <FileName title={file.data.filename}>
                                            🔒 {file.data.filename}
                                        </FileName>
                                        <FileMeta>
                                            <span>{formatBytes(file.data.size)}</span>
                                            <span>•</span>
                                            <span>{formatDate(file.data.timestamp?.seconds)}</span>
                                        </FileMeta>
                                        <FileActions>
                                            <ActionButton onClick={() => handleDecryptClick(file)}>
                                                🔐 Decrypt & Download
                                            </ActionButton>
                                            <ActionButton $secondary onClick={() => testWrongPassword(file)}>
                                                🧪 Test Wrong Password
                                            </ActionButton>
                                            <ActionButton $secondary onClick={() => downloadEncrypted(file)}>
                                                ⬇️ Download .enc
                                            </ActionButton>
                                        </FileActions>
                                    </FileInfo>
                                </FileCard>
                            ))}
                        </FilesGrid>
                    )}
                </DataContainer>
            </HomeContainer>

            {/* Upload Modal (same as FileUploadModal) */}
            <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} disableEnforceFocus disableAutoFocus>
                <ModalPopup>
                    <span onClick={() => setUploadOpen(false)}>
                        <Lottie loop animationData={closeJson} play style={{ width: 40, height: 40 }} />
                    </span>
                    <form onSubmit={handleUploadSubmit}>
                        <ModalHeading>
                            <h3>{encrypting ? "Encrypting..." : "Select file to encrypt & upload"}</h3>
                        </ModalHeading>
                        <ModalBody>
                            {encrypting ? (
                                <>
                                    <UploadingPara>
                                        <Lottie loop animationData={uploadJson} play style={{ width: 120, height: 80 }} />
                                    </UploadingPara>
                                    <ModalProgress>
                                        <ProgressBar progress={progress} />
                                        <ProgressText>{progress}%</ProgressText>
                                    </ModalProgress>
                                </>
                            ) : (
                                <>
                                    <div className="modal__file">
                                        <p>{selectedFileName ? selectedFileName : "No file chosen"}</p>
                                        <label htmlFor="file">
                                            <UploadFileIcon /> Choose a file
                                        </label>
                                        <input id="file" type="file" onChange={handleFileSelect} />
                                    </div>
                                    <input type="submit" className="modal__submit" value="🔐 Encrypt & Save" />
                                </>
                            )}
                        </ModalBody>
                    </form>
                </ModalPopup>
            </Modal>

            {/* Password Modal */}
            {showPasswordModal && (
                <PasswordModal
                    title={passwordAction === "encrypt" ? "Set encryption password" : "Enter decryption password"}
                    onSubmit={passwordAction === "encrypt" ? handleEncryptWithPassword : handleDecryptWithPassword}
                    onCancel={() => {
                        setShowPasswordModal(false);
                        setFileToDecrypt(null);
                    }}
                />
            )}
        </>
    );
};

// Helper functions
const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (seconds) => {
    if (!seconds) return "Just now";
    const date = new Date(seconds * 1000);
    return date.toLocaleDateString();
};

export default CryptoTest;

/* ================= STYLES (matching Drive clone) ================= */

const HeaderContainer = styled.div`
  position: sticky;
  width: 100%;
  top: 0;
  z-index: 999;
  background-color: var(--bg, #fff);
  border-bottom: 1px solid var(--border, #e5e7eb);
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  body.dark-mode & {
    background-color: #1f1f1f;
    border-color: #2e2e2e;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    width: 36px;
    height: 36px;
  }

  h2 {
    font-size: 18px;
    color: #5f6368;

    body.dark-mode & {
      color: #e5e7eb;
    }
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TestBadge = styled.span`
  background: #fef3c7;
  color: #92400e;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;

  body.dark-mode & {
    background: #422006;
    color: #fcd34d;
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;

  &:hover {
    background: rgba(0, 0, 0, 0.05);

    body.dark-mode & {
      background: rgba(255, 255, 255, 0.1);
    }
  }
`;

const BackButton = styled.a`
  padding: 8px 16px;
  border-radius: 8px;
  background: #0066da;
  color: white;
  text-decoration: none;
  font-size: 14px;

  &:hover {
    background: #034fa7;
  }
`;

const HomeContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 1;
  min-height: calc(100vh - 70px);
`;

const SidebarContainer = styled.div`
  width: 250px;
  padding: 20px;
  background: var(--bg, #fff);
  border-right: 1px solid var(--border, #e5e7eb);
  overflow-y: auto;

  body.dark-mode & {
    background: #1f1f1f;
    border-color: #2e2e2e;
  }

  @media (max-width: 768px) {
    width: 60px;
    padding: 10px;
  }
`;

const SidebarBtn = styled.div`
  button {
    background: transparent;
    border: 1px solid lightgray;
    display: flex;
    align-items: center;
    border-radius: 40px;
    padding: 5px 10px;
    box-shadow: 2px 2px 2px #ccc;
    cursor: pointer;

    body.dark-mode & {
      border-color: #3a3a3a;
      box-shadow: 2px 2px 2px #0a0a0a;
    }

    img {
      width: 36px;
      height: 36px;
    }

    span {
      font-size: 16px;
      margin-right: 20px;
      margin-left: 10px;
      color: #333;

      body.dark-mode & {
        color: #e5e7eb;
      }
    }

    @media (max-width: 768px) {
      padding: 5px;
      span {
        display: none;
      }
    }
  }
`;

const SidebarInfo = styled.div`
  margin-top: 30px;

  h4 {
    font-size: 14px;
    color: #5f6368;
    margin-bottom: 12px;

    body.dark-mode & {
      color: #9ca3af;
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const ResultsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  font-size: 11px;
`;

const EmptyResults = styled.div`
  color: #9ca3af;
  font-style: italic;
  padding: 10px 0;
`;

const ResultItem = styled.div`
  padding: 6px 8px;
  margin-bottom: 4px;
  background: ${(props) => (props.$success ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)")};
  border-radius: 4px;
  word-break: break-word;

  .time {
    color: #6b7280;
    margin-right: 4px;
  }

  .msg {
    color: ${(props) => (props.$success ? "#22c55e" : "#ef4444")};

    body.dark-mode & {
      color: ${(props) => (props.$success ? "#4ade80" : "#f87171")};
    }
  }
`;

const ClearBtn = styled.button`
  margin-top: 10px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: transparent;
  color: #5f6368;
  cursor: pointer;
  font-size: 12px;

  body.dark-mode & {
    border-color: #3a3a3a;
    color: #9ca3af;
  }
`;

const DataContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: var(--bg, #f8fafc);

  body.dark-mode & {
    background: #121212;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 24px;

  h2 {
    font-size: 22px;
    color: #111827;
    margin-bottom: 4px;

    body.dark-mode & {
      color: #e5e7eb;
    }
  }

  p {
    color: #6b7280;
    font-size: 14px;

    body.dark-mode & {
      color: #9ca3af;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;

  img {
    width: 200px;
    margin-bottom: 20px;
    opacity: 0.6;
  }

  p {
    font-size: 16px;
    margin-bottom: 8px;

    body.dark-mode & {
      color: #9ca3af;
    }
  }

  .sub {
    font-size: 14px;
    color: #9ca3af;
  }
`;

const FilesGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
`;

const FileCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  background: #fff;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  body.dark-mode & {
    background: #1f1f1f;
    border-color: #2e2e2e;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }
`;

const IconWrap = styled.div`
  svg {
    width: 40px;
    height: 40px;
    color: #6b7280;
  }

  body.dark-mode & svg {
    color: #d1d5db;
  }
`;

const FileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FileName = styled.div`
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  body.dark-mode & {
    color: #e5e7eb;
  }
`;

const FileMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 8px;

  body.dark-mode & {
    color: #9ca3af;
  }
`;

const FileActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.$secondary ? "#d1d5db" : "#0066da")};
  background: ${(props) => (props.$secondary ? "#f9fafb" : "#0066da")};
  color: ${(props) => (props.$secondary ? "#374151" : "#fff")};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$secondary ? "#f3f4f6" : "#034fa7")};
  }

  body.dark-mode & {
    border-color: ${(props) => (props.$secondary ? "#3a3a3a" : "#0066da")};
    background: ${(props) => (props.$secondary ? "#2a2a2a" : "#0066da")};
    color: ${(props) => (props.$secondary ? "#e5e7eb" : "#fff")};
  }
`;

/* Modal styles (same as FileUploadModal) */
const ModalPopup = styled.div`
  top: 50%;
  background-color: #fff;
  width: 100%;
  max-width: 500px;
  margin: 0px auto;
  position: relative;
  transform: translateY(-50%);
  padding: 10px;
  border-radius: 10px;

  body.dark-mode & {
    background-color: #1f1f1f;
  }

  span {
    position: absolute;
    right: 10px;
    top: 8px;
    cursor: pointer;
    color: #5f6368;
  }
`;

const ModalHeading = styled.div`
  text-align: center;
  border-bottom: 1px solid lightgray;
  height: 40px;

  h3 {
    color: #111827;

    body.dark-mode & {
      color: #e5e7eb;
    }
  }

  body.dark-mode & {
    border-color: #3a3a3a;
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;

  input.modal__submit {
    width: 100%;
    background: #0066da;
    padding: 10px 20px;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 14px;
    border: 0;
    outline: 0;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    transition: background 0.3s ease-in-out;

    &:hover {
      background: #034fa7;
    }
  }

  .modal__file {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 20px;
    color: #000;
    border: 2px dashed #0066da;
    border-radius: 5px;
    font-size: 16px;

    body.dark-mode & {
      color: #e5e7eb;
      border-color: #3b82f6;
    }

    p {
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }

    label {
      cursor: pointer;
      border-radius: 8px;
      border: 1px dashed #302f2f;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      color: #1a1a1a;

      body.dark-mode & {
        border-color: #6b7280;
        color: #e5e7eb;
      }

      svg {
        color: #1a1a1a;

        body.dark-mode & {
          color: #e5e7eb;
        }
      }
    }

    input {
      display: none;
    }
  }
`;

const UploadingPara = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
`;

const ModalProgress = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;

  body.dark-mode & {
    background-color: #3a3a3a;
  }

  &:after {
    content: "";
    display: block;
    height: 100%;
    background-color: #0066da;
    width: ${(props) => props.progress}%;
    transition: width 0.4s ease-in-out;
  }
`;

const ProgressText = styled.p`
  margin-top: 5px;
  font-size: 14px;
  font-weight: bold;
  color: #0066da;
`;
