import React, {useEffect, useState} from "react";
import AuthRequired from "../../components/auth/AuthRequired";
import ChatBody from "../../components/chatbody/ChatBody";
import Sidebar from "../../components/sidebar/Sidebar";
import ServerUrl from "../../api/serverUrl";
import CommonUtil from "../../util/commonUtil";
import SocketActions from "../../lib/socketActions";
import ApiEndpoints from "../../api/apiEndpoints";
import Constants from "../../lib/constants";
import ApiConnector from "../../api/apiConnector";
import AppPaths from "../../lib/appPaths";

let socket = new WebSocket(
    ServerUrl.WS_BASE_URL + `ws/users/${CommonUtil.getUserId()}/chat/`
);

const HomeScreen = (props) => {
    const [activeChat, setActiveChat] = useState(null);
    // const [currentChattingMember, setCurrentChattingMember] = useState({});
    const [onlineUserList, setOnlineUserList] = useState([]);
    const [chatList, setChatList] = useState([]); //sidebar users
    const [typing, setTyping] = useState(false);
    const [messages, setMessages] = useState({});

    const fetchChatUser = async () => {
        const url = ApiEndpoints.USER_CHAT_URL.replace(
            Constants.USER_ID_PLACE_HOLDER,
            CommonUtil.getUserId()
        );
        const chatList = await ApiConnector.sendGetRequest(url);
        // debugger;
        const formatedChatUser = CommonUtil.getFormatedChatUser(
            chatList,
            props.onlineUserList
        );
        setChatList(formatedChatUser);
        redirectUserToDefaultChatRoom(formatedChatUser);
    };

    const redirectUserToDefaultChatRoom = (chatList) => {
        if (props?.location?.pathname === AppPaths.HOME) {
            setActiveChat(chatList[0]);
            // debugger;
            // props.history.push("/c/" + chatList[0].roomId);
        } else {
            const activeChatId = CommonUtil.getActiveChatId(props.match);
            const chatUser = chatList.find((user) => user.roomId === activeChatId);
            setActiveChat(chatUser);
        }
    };

    useEffect(() => {
        fetchChatUser();
    }, []);

    socket.onmessage = (event) => {
        debugger;
        const data = JSON.parse(event.data);
        const chatId = CommonUtil.getActiveChatId(props.match); // todo get from activeChat
        const userId = CommonUtil.getUserId();
        if (chatId === data.roomId) {
            if (data.action === SocketActions.MESSAGE) {
                data["userImage"] = ServerUrl.BASE_URL.slice(0, -1) + data.userImage;
                setMessages((prevState) => {
                    let messagesState = JSON.parse(JSON.stringify(prevState));
                    messagesState.results.unshift(data);
                    return messagesState;
                });
                setTyping(false);
            } else if (data.action === SocketActions.TYPING && data.user !== userId) {
                setTyping(data.typing);
            }
        }
        if (data.action === SocketActions.ONLINE_USER) {
            setOnlineUserList(data.userList);
        } else if (data.action === SocketActions.START_CHAT) {
            fetchChatUser();
        }
    };

    return (
        <main className="content">
            <div className="container-fluid p-0">
                <div className="container-fluid">
                    <div className="row g-0">
                        <Sidebar
                            socket={socket}
                            onActiveChatChange={setActiveChat}
                            onlineUserList={onlineUserList}
                            chatList={chatList}
                            // onChatListChange={setChatList}
                            {...props}
                        />
                        <ChatBody
                            socket={socket}
                            // onOnlineUserListChange={setOnlineUserList}
                            onMessagesChange={setMessages}
                            activeChat={activeChat}
                            typing={typing}
                            messages={messages}
                            {...props}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AuthRequired(HomeScreen);
