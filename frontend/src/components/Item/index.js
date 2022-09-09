import ItemMeta from "./ItemMeta";
import CommentContainer from "./CommentContainer";
import React from "react";
import agent from "../../agent";
import { connect } from "react-redux";
import marked from "marked";
import {
  ITEM_PAGE_LOADED,
  ITEM_PAGE_UNLOADED,
} from "../../constants/actionTypes";

const mapStateToProps = (state) => ({
  ...state.item,
  currentUser: state.common.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
  onLoad: (payload) => dispatch({ type: ITEM_PAGE_LOADED, payload }),
  onUnload: () => dispatch({ type: ITEM_PAGE_UNLOADED }),
});

class Item extends React.Component {
  componentWillMount() {
    this.props.onLoad(
      Promise.all([
        agent.Items.get(this.props.match.params.id),
        agent.Comments.forItem(this.props.match.params.id),
      ])
    );
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    const { item } =  this.props;

    if (!item) {
      return null;
    }

    const imgPath = item.image || '/placeholder.png';

    const markup = {
      __html: marked(item.description, { sanitize: true }),
    };
    const canModify =
      this.props.currentUser &&
      this.props.currentUser.username === item.seller.username;
    return (
      <div className="container page">
        <div className="text-dark">
          <div className="row bg-white p-4">
            <div className="col-6">
              <img
                src={imgPath}
                alt={item.title}
                className="item-img"
                style={{ height: "500px", width: "100%", borderRadius: "6px" }}
              />
            </div>

            <div className="col-6">
              <h1>{item.title}</h1>
              <ItemMeta item={item} canModify={canModify} />
              <div dangerouslySetInnerHTML={markup}></div>
              {item.tagList.map((tag) => {
                return (
                  <span className="badge badge-secondary p-2 mx-1" key={tag}>
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="row bg-light-gray p-4">
            <CommentContainer
              comments={this.props.comments || []}
              errors={this.props.commentErrors}
              slug={this.props.match.params.id}
              currentUser={this.props.currentUser}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Item);
