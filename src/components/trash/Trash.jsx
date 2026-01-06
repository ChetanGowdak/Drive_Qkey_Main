import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
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
import LottieImage from "../common/LottieImage";

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

      {!loading && files.length > 0 && (
        <TrashHeader>
          <FileCountBadge>
            <span className="count">{files.length}</span>
            <span className="label">file{files.length > 1 ? 's' : ''} in trash</span>
          </FileCountBadge>
          <EmptyTrashBtn onClick={handleEmptyTrash} disabled={emptying}>
            {emptying ? "Emptying..." : "🗑️ Empty Trash"}
          </EmptyTrashBtn>
        </TrashHeader>
      )}

      {loading ? (
        <LoaderContainer />
      ) : files.length === 0 ? (
        <EmptyState>
          <LottieImage
            imagePath={"/trash.svg"}
            text1={"No files in Trash"}
            text2={"Items you delete will appear here"}
          />
        </EmptyState>
      ) : (
        <Grid>
          {files.map((file, index) => (
            <Card key={file.id} style={{ animationDelay: `${index * 0.05}s` }}>
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
                  <span>{changeBytes(file.data.originalSize || file.data.size)}</span>
                  <span>•</span>
                  <span>
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
                    <DeleteIcon /> Delete
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

/* ================= ANIMATIONS ================= */

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ================= STYLES ================= */

const TrashContainer = styled.div`
  flex: 1;
  padding: 16px 20px 0 20px;
  background: var(--bg);
  display: flex;
  flex-direction: column;
`;

const TrashHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
`;

const FileCountBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
  border-radius: 20px;
  border: 1px solid var(--border);

  .count {
    font-size: 15px;
    font-weight: 700;
    color: var(--error);
  }

  .label {
    font-size: 12px;
    color: var(--text-muted);
  }
`;

const EmptyTrashBtn = styled.button`
  padding: 10px 18px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 14px;
  margin-top: 16px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

const Card = styled.div`
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: var(--bg-secondary);
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.4s ease forwards;
  opacity: 0;

  &:hover {
    border-color: var(--error);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.1);
    transform: translateY(-2px);
  }
`;

const IconWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
  flex-shrink: 0;

  svg {
    font-size: 24px;
    color: var(--text-muted);
  }
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  flex-wrap: wrap;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const RestoreBtn = styled.button`
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
`;

const DeleteBtn = styled.button`
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--error);
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    font-size: 14px;
  }

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: var(--error);
  }
`;

const EmptyState = styled.div`
  width: 100%;
  padding: 20px;
`;
