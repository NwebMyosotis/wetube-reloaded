import { async } from "regenerator-runtime";

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
let deleteBtns = document.querySelectorAll(".button__delete");
//elements들은 가짜 코멘트 작성히 계속 업데이트가 되어야하기 때문에 데이터를 추가해주기 위해 let
let commentCount = document.getElementById("count-comment");
let commentLength = document.querySelectorAll(".video__comment").length;

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const span2 = document.createElement("span");
  span2.className = "button__delete";
  span2.innerText = " ⓧ";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json(); //backend로부터 json object(newCommentId를 받음)
    addComment(text, newCommentId);
    const deleteBtn = document.querySelector(".button__delete");
    deleteBtn.removeEventListener("click", handleDelete);
    deleteBtn.addEventListener("click", handleDelete);
    //가짜 코멘트에는 이벤트가 제대로 들어와있지 않은 상태이기에 제거 및 재생성을 통해 이벤트를 다시 부여해줘야 함.
    commentLength = document.querySelectorAll(".video__comment").length;
    commentCount.innerText = `댓글 ${commentLength}개`;
  }
};
if (form) {
  form.addEventListener("submit", handleSubmit);
}

const handleDelete = async (event) => {
  const parentList = event.srcElement.parentElement;
  const commentId = parentList.dataset.id;
  await fetch(`/api/comments/${commentId}/delete`, {
    method: "DELETE",
  });
  parentList.remove();
  commentLength = document.querySelectorAll(".video__comment").length;
  commentCount.innerText = `댓글 ${commentLength}개`;
};

if (deleteBtns) {
  deleteBtns.forEach(
    (
      deleteBtn // 댓글 작성후 .deleteBtns 전체를 업데이트 시키려면 querySelectorAll 을 해야하는데 이 상태로 모든 삭제 버튼에 이벤트리스너를 부여하려면 forEach로 넣어줘야함
    ) => deleteBtn.addEventListener("click", handleDelete)
  );
}

//querySelector는 전체를 가져오는 게 아니라 조건에 해당하는 첫번째 element를 반환함.
//조건에 맞는 전체를 가져오기 위해서는 querySelectorAll을 사용해 주어야 한다.
//이렇게 가져온 elements에 forEach 없이 이벤트를 실행하면 전체에 이벤트가 부여됨
//하나하나에 별도의 이벤트를 주려면 forEach사용.
//foreach는 배열의 값들에 하나하나에 함수를 부여해주는 기능을 함.
