"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import Layout from "../components/layout";
import {
  AddAttachments,
  handleNewAttachments,
} from "../components/common-props/add-attachment";
import Sign from "../components/signin";
import Loading from "../components/loading";
import Unauthorise from "../components/unauthorise";

const MAX_BANNER_SIZE = 10 * 1024 * 1024;

function attachmentList(value) {
  return Array.isArray(value)
    ? value.filter(
        (item) =>
          item &&
          typeof item.url === "string" &&
          /^https?:\/\//i.test(item.url.trim())
      )
    : [];
}

function BannerEventPreview({ event, close }) {
  const attachments = attachmentList(event.attachments);
  return (
    <Dialog open onClose={close} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
        <IconButton aria-label="Close preview" onClick={close} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0, pb: 3 }}>
        {/* This intentionally mirrors EventListingCard on the public Events page. */}
        <Box
          component="article"
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: 2,
            backgroundColor: "#fff",
            p: 2,
            textAlign: "left",
          }}
        >
          <Box
            component="img"
            src={event.banner_image}
            alt=""
            sx={{
              mb: 1.5,
              width: "100%",
              aspectRatio: "16 / 9",
              objectFit: "contain",
            }}
          />
          <Box component="h3" sx={{ color: "#7f1d1d", fontWeight: 600 }}>
            {event.title}
          </Box>
          {attachments.map((attachment, index) => (
            <Link
              key={`${attachment.url}-${index}`}
              href={attachment.url.trim()}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "block",
                mt: 1,
                color: "#1d4ed8",
                fontSize: "0.875rem",
                textDecoration: "underline",
              }}
            >
              {attachment.caption || "Event attachment"}
            </Link>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

function Editor({ event, close, saved }) {
  const [title, setTitle] = useState(event.title || "");
  const [file, setFile] = useState(null);
  const [existing, setExisting] = useState(attachmentList(event.attachments));
  const [added, setAdded] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      let banner = event.banner_image;
      if (file) {
        if (!file.type.startsWith("image/") || file.size > MAX_BANNER_SIZE)
          throw Error("Choose a banner image of 10 MB or smaller.");
        const form = new FormData();
        form.append("file", file);
        const upload = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });
        if (!upload.ok) throw Error("Banner upload failed.");
        banner = (await upload.json()).url;
      }
      if (!banner) throw Error("Upload an event banner.");

      const newAttachments = await handleNewAttachments(
        added.filter((item) => item.url).map((item) => ({ ...item }))
      );
      if (newAttachments.some((item) => !item.url))
        throw Error("An attachment upload failed.");

      const response = await fetch("/api/banner-events", {
        method: event.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: event.id,
          title,
          banner_image: banner,
          attachments: [
            ...existing,
            ...newAttachments.map((item) => ({
              caption: item.caption || "",
              url: item.url,
            })),
          ],
        }),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.message || "Unable to save event.");
      saved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onClose={busy ? undefined : close} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={submit}>
        <DialogTitle>{event.id ? "Edit" : "Add"} banner event</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              required
              label="Event title"
              value={title}
              inputProps={{ maxLength: 1000 }}
              onChange={(e) => setTitle(e.target.value)}
            />
            {event.banner_image && (
              <Box
                component="img"
                src={event.banner_image}
                alt="Current event banner"
                sx={{ maxHeight: 180, maxWidth: "100%", objectFit: "contain" }}
              />
            )}
            <Button component="label" variant="outlined">
              {file
                ? file.name
                : event.banner_image
                ? "Replace event banner"
                : "Upload event banner"}
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </Button>
            <Typography variant="caption" color="text.secondary">
              Image files only, up to 10 MB.
            </Typography>
            <Typography variant="subtitle2">Attachments and links</Typography>
            {existing.map((attachment, index) => (
              <Box
                key={`${attachment.url}-${index}`}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Link
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ overflowWrap: "anywhere" }}
                >
                  {attachment.caption || attachment.url}
                </Link>
                <Button
                  size="small"
                  color="error"
                  onClick={() =>
                    setExisting(
                      existing.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                >
                  Remove
                </Button>
              </Box>
            ))}
            <AddAttachments attachments={added} setAttachments={setAdded} />
            {error && (
              <Typography role="alert" color="error">
                {error}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy} variant="contained" type="submit">
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

function Manager() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [editor, setEditor] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/banner-events?page=${page + 1}&limit=${rowsPerPage}`,
        { cache: "no-store" }
      );
      const result = await response.json();
      if (!response.ok)
        throw Error(result.message || "Unable to load banner events.");
      setRows(result.data);
      setTotal(result.total);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(row) {
    if (!window.confirm(`Delete ${row.title}?`)) return;
    try {
      const response = await fetch("/api/banner-events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });
      const result = await response.json();
      if (!response.ok)
        throw Error(result.message || "Unable to delete event.");
      if (rows.length === 1 && page > 0) setPage(page - 1);
      else await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <Box sx={{ m: 4 }}>
        <Typography
          variant="h4"
          sx={{ mb: 3, color: "#690000", fontWeight: 700 }}
        >
          Banner Events Management
        </Typography>
        <Paper sx={{ width: "100%", overflow: "hidden", p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">Banner Events</Typography>
            <Button
              variant="contained"
              onClick={() => setEditor({})}
              sx={{
                backgroundColor: "#830001",
                "&:hover": { backgroundColor: "#9a0000" },
              }}
            >
              Add Banner Event
            </Button>
          </Box>
          {error && (
            <Typography role="alert" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Event Title
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Banner
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Attachments
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        {row.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        component="img"
                        src={row.banner_image}
                        alt=""
                        sx={{
                          display: "block",
                          width: 96,
                          height: 54,
                          objectFit: "contain",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {attachmentList(row.attachments).length}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Preview as shown on the website">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => setPreview(row)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => setEditor(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => remove(row)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!rows.length && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No banner events found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
        {editor && (
          <Editor
            key={editor.id || "new"}
            event={editor}
            close={() => setEditor(null)}
            saved={() => {
              setEditor(null);
              load();
            }}
          />
        )}
        {preview && (
          <BannerEventPreview event={preview} close={() => setPreview(null)} />
        )}
      </Box>
    </Layout>
  );
}

export default function Page() {
  const { data, status } = useSession();
  if (status === "loading") return <Loading />;
  if (!data) return <Sign />;
  return data.user.role === "SUPER_ADMIN" ? <Manager /> : <Unauthorise />;
}
