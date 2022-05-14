import React from "react";

import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { columns, collapseStyling } from "../PlaylistTracks/columns";

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')


const addedAtToDateAdded = (addedAt: string): string => {
  return timeAgo.format(Date.parse(addedAt)) as string;
}

const durationMsToHrsMins = (durationMs: number): string => {
  const durationSec = durationMs / 1000;
  const mins = Math.floor(durationSec / 60);
  const secs = Math.floor(durationSec % 60);
  return `${mins}:${`${secs}`.padStart(2, '0')}`;
}

const Cell = styled(TableCell)(({ theme }) => ({
  borderBottom: "none",
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  }
}));

const Link = styled(MuiLink)(({ theme }) => ({
  overflow: "hidden",
  textOverflow: "ellipsis",
  // whiteSpace: "nowrap"
}));

const Row = styled(TableRow)(() => ({
  "&:first-child td:first-child": { borderTopLeftRadius: "3px" },
  "&:first-child td:last-child": { borderTopRightRadius: "3px" },
  "&:last-child td:first-child": { borderBottomLeftRadius: "3px" },
  "&:last-child td:last-child": { borderBottomRightRadius: "3px" },
}));

interface TrackProps {
  addedAt: string;
  album: any;
  artists: any[];
  duration: number;
  index: number;
  name: string;
  url: string;
}

export const Track = (props: TrackProps) => {
  const { addedAt, album, artists, duration, index, name, url } = props;

  return (
    <Row hover tabIndex={-1}>
      <Cell align={columns.index.align}>
        <Typography color="textSecondary">{index}</Typography>
      </Cell>

      <Cell align={columns.title.align} sx={{ display: "flex", alignItems: "center" }}>
        <img src={album.images?.[0]?.url} alt="album artwork" height={40} width={40}/>
        <Box sx={{ pl: 2, minWidth: 0 }}>
          <Link
            href={url}
            color="textPrimary"
            underline="none"
            sx={{ display: "inline-block "}}
          >
            {name}
          </Link>
          <Box sx={{ minWidth: 0 }}>
            {artists.map((artist, i) => {
              return (
              <React.Fragment key={artist.name}>
                {i > 0 &&(
                  <Typography color="textSecondary" sx={{ display: "inline-block", mr: 0.5 }}>, </Typography>
                )}
                <Link
                  href={artist.external_urls.spotify}
                  color="textSecondary"
                  underline="hover"
                  sx={{ display: "inline-block "}}
                >
                  {artist.name}
                </Link>
              </React.Fragment>
              );
            })}
          </Box>
        </Box>
      </Cell>

      <Cell align={columns.album.align}>
        <Link 
          href={album.external_urls.spotify}
          color="textSecondary"
          underline="hover"
          sx={{ display: "inline-block "}}
        >
          {album.name}
        </Link>
      </Cell>

      <Cell
        align={columns.dateAdded.align}
        sx={collapseStyling(columns.dateAdded.collapse, "table-cell")}
      >
        <Typography color="textSecondary">{addedAtToDateAdded(addedAt)}</Typography>
      </Cell>

      <Cell
        align={columns.duration.align}
        sx={collapseStyling(columns.duration.collapse, "table-cell")}
      >
        <Typography color="textSecondary">{durationMsToHrsMins(duration)}</Typography>
      </Cell>
    </Row>
  );
}