import React, { useEffect, useState } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import { auth } from "../../firebase";
import {
  getTrashFiles,
  restoreFile,
  handleDeleteFromTrash,
  deleteFromTrashPermanently,
} from "../common/firebaseApi";
import FileIcons from "../common/FileIcons";
import { changeBytes, convertDates } from "../common/common";
import { DeleteIcon } from "../common/SvgIcons";
import LoaderContainer from "../loaders/LoaderContainer";
import { toast } from "react-toastify";

const Trash = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emptying, setEmptying] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = getTrashFiles(user.uid, (data) => {
      setFiles(data);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, []);

  // 🗑️ Empty all trash
  const handleEmptyTrash = async () => {
    if (files.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete all ${files.length} files? This cannot be undone.`
    );

    if (!confirmed) return;

    setEmptying(true);
    try {
      for (const file of files) {
        await deleteFromTrashPermanently(file.id);
      }
      toast.success("Trash emptied successfully! 🗑️");
    } catch (err) {
      console.error("Error emptying trash:", err);
      toast.error("Failed to empty trash");
    } finally {
      setEmptying(false);
    }
  };

  return (
    <TrashContainer>
      <PageHeader pageTitle={"Trash"} />

      {/* 🗑️ Trash Header with Empty Trash button */}
      {!loading && files.length > 0 && (
        <TrashHeader>
          <FileCount>{files.length} file{files.length > 1 ? 's' : ''} in trash</FileCount>
          <EmptyTrashBtn
            onClick={handleEmptyTrash}
            disabled={emptying}
          >
            {emptying ? "Emptying..." : "🗑️ Empty Trash"}
          </EmptyTrashBtn>
        </TrashHeader>
      )}

      {loading ? (
        <LoaderContainer />
      ) : files.length === 0 ? (
        <EmptyState>
          <img src="/trash.svg" alt="Empty Trash" />
          <p>No files in Trash</p>
        </EmptyState>
      ) : (
        <Grid>
          {files.map((file) => (
            <Card key={file.id}>
              <IconWrap>
                <FileIcons
                  type={
                    file.data.originalType ||
                    file.data.contentType ||
                    "application/octet-stream"
                  }
                />
              </IconWrap>

              <Info>
                <Title title={file.data.filename}>🗑 {file.data.filename}</Title>
                <Meta>
                  <span>
                    {changeBytes(file.data.originalSize || file.data.size)}
                  </span>
                  <span>•</span>
                  <span>
                    Deleted:{" "}
                    {convertDates(
                      file.data.deletedAt?.seconds ||
                      file.data.timestamp?.seconds
                    )}
                  </span>
                </Meta>

                <Actions>
                  <RestoreBtn onClick={() => restoreFile(file.id)}>
                    ♻ Restore
                  </RestoreBtn>
                  <DeleteBtn
                    onClick={() => handleDeleteFromTrash(file.id, file.data)}
                  >
                    <DeleteIcon /> Delete forever
                  </DeleteBtn>
                </Actions>
              </Info>
            </Card>
          ))}
        </Grid>
      )}
    </TrashContainer>
  );
};

export default Trash;

/* ----------------------------- 🧩 Styles ----------------------------- */
const TrashContainer = styled.div`
  flex: 1;
  padding: 10px 10px 0 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const TrashHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;

  body.dark-mode & {
    border-bottom-color: #374151;
  }
`;

const FileCount = styled.span`
  font-size: 14px;
  color: #6b7280;

  body.dark-mode & {
    color: #9ca3af;
  }
`;

const EmptyTrashBtn = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #991b1b;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover:not(:disabled) {
    background: #fee2e2;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  body.dark-mode & {
    color: #f87171;
    border-color: #7f1d1d;
    background: #2b1818;
  }
  body.dark-mode &:hover:not(:disabled) {
    background: #3f1f1f;
  }
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
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #fff;
  transition: background 0.25s ease, border-color 0.25s ease;

  /* 🌙 Dark Mode */
  body.dark-mode & {
    background: #1f1f1f;
    border-color: #2e2e2e;
  }
  body.dark-mode &:hover {
    background: #2a2a2a;
    border-color: #3a3a3a;
  }

  /* 📱 Stack layout for narrow screens */
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const IconWrap = styled.div`
  flex: 0 0 auto;
  display: grid;
  place-items: center;

  svg {
    font-size: 32px;
    color: #6b7280;
  }

  /* 🌙 Dark Mode */
  body.dark-mode & svg {
    color: #d1d5db;
  }

  @media (max-width: 600px) {
    svg {
      font-size: 36px;
    }
  }
`;

const Info = styled.div`
  display: grid;
  gap: 8px;
  flex: 1;
  min-width: 0;

  @media (max-width: 600px) {
    align-items: center;
  }
`;

const Title = styled.div`
  font-weight: 600;
  color: #111827;
  max-width: 22ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;

  body.dark-mode & {
    color: #e5e7eb;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    max-width: 100%;
    white-space: normal;
  }
`;

const Meta = styled.div`
  display: flex;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  flex-wrap: wrap;
  justify-content: flex-start;

  body.dark-mode & {
    color: #9ca3af;
  }

  @media (max-width: 480px) {
    justify-content: center;
    text-align: center;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 6px;

  @media (max-width: 480px) {
    justify-content: center;
    gap: 8px;
  }
`;

const BtnBase = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }

  /* 🌙 Dark Mode */
  body.dark-mode & {
    border-color: #3a3a3a;
    background: #2a2a2a;
    color: #e5e7eb;
  }

  body.dark-mode &:hover {
    background: #333;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const RestoreBtn = styled(BtnBase)`
  color: #065f46;
  border-color: #a7f3d0;
  background: #ecfdf5;

  &:hover {
    background: #d1fae5;
  }

  body.dark-mode & {
    color: #34d399;
    border-color: #065f46;
    background: #1b2b23;
  }
  body.dark-mode &:hover {
    background: #1e3a31;
  }
`;

const DeleteBtn = styled(BtnBase)`
  color: #991b1b;
  border-color: #fecaca;
  background: #fef2f2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: #fee2e2;
  }

  body.dark-mode & {
    color: #f87171;
    border-color: #7f1d1d;
    background: #2b1818;
  }
  body.dark-mode &:hover {
    background: #3f1f1f;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  animation: fadeInScale 0.6s ease-out;

  img {
    width: 300px;
    opacity: 0.95;
    pointer-events: none;
    user-select: none;
  }

  p {
    margin-top: 8px;
    font-size: 15px;
    font-weight: 500;
    color: #6b7280;
    opacity: 0;
    animation: textFade 0.4s ease-out forwards;
    animation-delay: 0.3s;
  }

  body.dark-mode & p {
    color: #9ca3af;
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes textFade {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 480px) {
    img {
      width: 220px;
    }

    p {
      font-size: 14px;
    }
  }
`;
