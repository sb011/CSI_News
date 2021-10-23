import React,{ useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDataAPI, patchDataAPI } from './../../utils/fetchData';
import moment from 'moment';
import bookmark from '../../images/bookmark.png';
import bookmark_fill from '../../images/bookmark_fill.png';
import jwt from 'jsonwebtoken';
import AddIcon from '../../images/plus.png';
import AddComments from '../../components/addComments';
import "../../styles/admin.css";

const News = () => {
    const { id } = useParams();
    const [news, setNews] = useState([]);
    const [user, setUser] = useState([]);
    const [saved, setSaved] = useState();
    const [addCmnt, setAddCmnt] = useState(false);
    const [cmnt, setCmnt] = useState([]);
    const user_id = jwt.decode(localStorage.getItem("user")).id;
    
    useEffect(() => {
        async function fetchData() {
            const res = await getDataAPI(`/news/${id}`);
            setNews(res.data.news);
            setCmnt(res.data.comments);
            console.log(res);
            const res1 = await getDataAPI(`user/${user_id}`);
            setUser(res1.data.user);
        }
        fetchData();
    },[id, user_id]);

    useEffect(() => {
        if(user.saved){
            for(var i = 0; i < user.saved.length; i++){
                if(id === user.saved[i]){
                    setSaved(true);
                    break;
                }
            }
        }
        else{
            setSaved(false); 
        }
    }, [user.saved, id])

    const handleSaveNews = async () => {
        try {
            const newUser = {...user, saved: [...user.saved, id]};
            await patchDataAPI(`saveNews/${user_id}/${id}`, newUser);
            setSaved(true);
        } catch (err) {
            err.response.data.msg && setSaved({...saved, err: err.response.data.msg});
        }
    }

    const handleUnSaveNews = async () => {
        try {
            const newUser = {...user, saved: user.saved.filter(i => i !== id)};
            await patchDataAPI(`unsaveNews/${user_id}/${id}`, newUser);
            setSaved(false);
        } catch (err) {
            err.response.data.msg && setSaved({...saved, err: err.response.data.msg});
        }
    }

    if (!news.images) {
        return <span>Loading...</span>;
    }

    return (
        <div className="news_container">
            <div className="newscard__img">
                <img className="newscard__i" src={news.images[0].url} alt="news"/>
            </div>
            <div className="newscard__header">
                <p className="newscard__title">{news.title}</p>
                <div className="newscard__func">Category: {news.category}</div>
                <div className="newscard__func">{moment(news.createdAt).fromNow()}</div>
            </div>
            <div className="newscard__content">{news.content}</div>
            <div className="newscard__menu">
                {
                    saved
                    ? <img src={bookmark_fill} className="newscard__bookmark" alt="bookmark" onClick={handleUnSaveNews}/>
                    : <img src={bookmark} className="newscard__bookmark" alt="bookmark" onClick={handleSaveNews}/>
                }
                <button className="newscard__btn" onClick={() => setAddCmnt(true)}>
                    <img className="newscard__bookmark" src={AddIcon} alt="plus" />
                </button>
            </div>
            {
                addCmnt && <AddComments setAddCmnt={setAddCmnt} postId={news._id} postUserId={news.user}/>
            }
            <h2>Comments: </h2>
            {
                cmnt.map( (cmnt,index) =>(
                    <div className="comment__card">
                    <h2 className="comment">{cmnt.content}</h2>
                    </div>
                ))
            }
        </div>
    )
};

export default News;