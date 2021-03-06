import React, { useEffect, Fragment, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Dialogs from "../dialogs"
import UserList from "../user/UserList"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSync } from "@fortawesome/free-solid-svg-icons/faSync"
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser"
import grey from '@mui/material/colors/grey';
import red from '@mui/material/colors/red';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import useFetch from "../../useFetch"
import { useStates } from "from-react-context"
import { socket } from "../App"
import useStyles from "./style"
import LoadImage from "../../../../public/images/circle.gif"
import moment from "moment"
import Flash from "../flash"
import Search from "../search"
import { Helmet } from 'react-helmet';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/material/styles/useTheme';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';

const Conversation = () => {
  const [User] = useStates("User")
  const navigate = useNavigate()
  const classes = useStyles()
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] =useStates("IsDialogOpen");
  const [isAuthorized] = useStates("FlashError")
  const [Message, setMessage] = useStates("Messages");
  const [ReceivedBy] = useStates("ReceivedBy")
  const { loading, data, error, send } = useFetch(`conversation/${ReceivedBy._id}`, {
    method: "GET",
    onCompleted: (data) => {
      setMessage(data)
    },
    onError: (err) => {
      console.log(err)
    }
  })
  useEffect(() => {
    send()
  }, [ReceivedBy])
  //receive message from socket
  useEffect(() => {
    socket.on("getMsg", data => {
      const recvId = localStorage.getItem("_ftrd")
      if (recvId == data.sentBy) {
        setMessage((prev) => [...prev, data])
      }
    })
  }, [socket])
  useEffect(() => {
    const element = document.getElementById("Msg-container")
    element.scrollTo(0, element.scrollHeight)
  }, [Message])
  //The conversation can not be occured unless the user and recipiant existe
  function mimeTypeHandler(type, link) {
    switch (type) {
      case "image":
        return (<div style={{ width: "100%", height: "100%" }}>
          <img className={classes.cover} src={link} />
        </div>)
        break;
      case "video":
        return (<div style={{ width: "100%", height: "100%" }}>
          <video controls preload="none" className={classes.cover} src={link} />
        </div>)
        break;
      case "audio":
        return (<div style={{ width: "100%", height: "100%" }}>
          <audio controls preload="none" src={link} />
        </div>)
        break;
      default:
        break;
    }
  }

  return (
    <>
      <Helmet>
        <title>Meet-Stranger | Conversation</title>
      </Helmet>
      {isAuthorized.status && <Flash state="isFileUpload" severity="error">{isAuthorized.message}</Flash>}
      {!isMobile &&
        <Fragment>
          <Box display="flex" alignItems="center" sx={{ bgColor: "background.paper" }}>
            <List sx={{ width: '100%' }}>
              <ListItem>
                {ReceivedBy.hasOwnProperty("_id") &&
                  <ListItemAvatar>
                    <Avatar
                      sx={{ bgcolor: red[500] }}
                      onClick={() => navigate(`/user/${ReceivedBy.username}`)}
                      alt={ReceivedBy.username}
                      src={ReceivedBy.profile}
                      className={classes.image}
                    />
                  </ListItemAvatar>
                }
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      {ReceivedBy.username}
                    </Typography>}
                  secondary={
                    <Typography variant="body1">
                      {moment().format('ll')}
                    </Typography>
                  }
                />
              </ListItem>
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <Box>
              <IconButton
                onClick={() => setOpen(true)}
              >
                <FontAwesomeIcon icon={faUser} />
              </IconButton>
            </Box>
          </Box>
          <Divider />
        </Fragment>
      }

      <div id="Msg-container"
        className={(loading && Message.length === 0)
          ? classes.MsgContainerJustify
          : classes.MsgContainer
        }

      >

        {(loading && Message.length === 0) ? <FontAwesomeIcon icon={faSync} size={32} className="fa-spin" />
          : (Message.length > 0) && Message.map((msg, index) => (
            <>
              {
                User._id === msg.user._id ?
                  (<>

                    <Box key={index} display="flex" alignItems="center">
                      <Avatar
                        alt="name"
                        src={msg.user.profile}
                      />
                      <Box className={classes.sending_container}>
                        <div>
                          {msg.content.type == "file"
                            ? mimeTypeHandler(msg.content.mimeType, msg.content.body)
                            : <Typography style={{ wordBreak: "break-all", hyphens: "manual" }} variant="body1">
                              {msg.content.body}
                            </Typography>
                          }
                        </div>
                      </Box>
                    </Box>
                    <Box style={{ width: "60%" }} display="flex" alignItems="center" justifyContent="flex-end">
                      <Typography
                        variant="body2"
                        style={{ color: grey[500] }}
                      >
                        {moment(msg.createdAt).fromNow()}
                      </Typography>
                    </Box>
                  </>
                  ) : (
                    <>
                      <Box key={index} display="flex" alignItems="center" justifyContent="flex-end">
                        <Avatar
                          alt="name"
                          src={msg.user.profile}
                        />
                        <Box className={classes.receiving_container}>
                          <div>
                            {msg.content.type == "file"
                              ? mimeTypeHandler(msg.content.mimeType, msg.content.body)
                              : <Typography style={{ wordBreak: "break-all", hyphens: "manual" }} variant="body1">
                                {msg.content.body}
                              </Typography>
                            }
                          </div>

                        </Box>
                      </Box>

                      <Box display="flex" pr={2} alignItems="center" justifyContent="flex-end">
                        <Typography
                          variant="body2"
                          style={{ color: grey[500] }}
                        >
                          {moment(msg.createdAt).fromNow()}
                        </Typography>
                      </Box>

                    </>
                  )}
            </>
          ))
        }

      </div>
      <Dialogs
        open={open}
        setOpen={setOpen}
        ModalTitle={<Search />}
      >
        <UserList />
      </Dialogs>
    </>
  )
}
export default Conversation