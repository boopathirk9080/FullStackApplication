import React, { useContext, useEffect, useRef, useState } from "react";
import uniqid from "uniqid";
import Quill from "quill";
import "quill/dist/quill.core.css";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { toast } from "sonner";
import axios from "axios";
import Loading from "../../components/common/Loading";

const AddCourse = () => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [discountEndDate, setDiscountEndDate] = useState("");
  const [whatsInTheCourse, setWhatsInTheCourse] = useState("");
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    isPreviewFree: false,
  });
  const [loading, setLoading] = useState(false);
  const { backendUrl, getToken } = useContext(AppContext);

  const handleChapter = (action, chapterId) => {
    if (action === "add") {
      const title = prompt("Enter chapter title");

      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder:
            chapters.length > 0
              ? chapters[chapters.length - 1].chapterOrder + 1
              : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === "remove") {
      setChapters(
        chapters.filter((chapter) => chapter.chapterId !== chapterId)
      );
    } else if (action === "toogle") {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      );
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === "add") {
      setShowPopup(true);
      setCurrentChapterId(chapterId);
    } else if (action === "remove") {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            chapter.chapterContent.splice(lectureIndex, 1);
          }
          return chapter;
        })
      );
    }
  };

  const addLecture = () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureId: uniqid(),
            lectureOrder:
              chapter.chapterContent.length > 0
                ? chapter.chapterContent[chapter.chapterContent.length - 1]
                    .lectureOrder + 1
                : 1,
          };
          chapter.chapterContent.push(newLecture);
        }
        return chapter;
      })
    );
    setShowPopup(false);
    setLectureDetails({
      lectureTitle: "",
      lectureDuration: "",
      lectureUrl: "",
      isPreviewFree: false,
      discount: 0,
      discountEndDate: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      return toast.error("Please select a thumbnail image");
    }
    const courseDescription = quillRef.current.root.innerHTML;
    const courseData = {
      courseTitle,
      courseDescription,
      coursePrice,
      discount,
      discountEndDate,
      whatsInTheCourse,
      courseContent: chapters,
    };
    // console.log(courseData);

    // add course to database with image
    const formData = new FormData();
    formData.append("courseData", JSON.stringify(courseData));
    formData.append("image", image);

    const token = await getToken();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/educator/add-course`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setCourseTitle("");
        setCoursePrice(0);
        setDiscount(0);
        setImage(null);
        setChapters([]);
        quillRef.current.root.innerHTML = "";
        setLoading(false);
      } else {
        toast.error(data.message);
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize Quill editor only once
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Enter your course description here...",
      });
    }
  }, []);

  return (
    <>
      {loading && <Loading />}
      <div className="h-screen overflow-scroll flex flex-col gap-10 items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <p>Course Title</p>
            <input
              onChange={(e) => setCourseTitle(e.target.value)}
              value={courseTitle}
              type="text"
              placeholder="type here"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p>Course Description</p>
            <div ref={editorRef}></div>
          </div>
          <div className="flex flex-col gap-1">
            <p>What's in the course</p>
            <textarea
              onChange={(e) => setWhatsInTheCourse(e.target.value)}
              value={whatsInTheCourse}
              placeholder="Enter what's in the course"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500"
            />
          </div>
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex flex-col gap-1">
              <p>Course Price</p>
              <input
                onChange={(e) => setCoursePrice(e.target.value)}
                type="number"
                placeholder="0"
                className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
                required
              />
            </div>
            <div className="flex md:flex-row flex-col items-center gap-3">
              <p>Courser Thumbnail</p>
              <label
                htmlFor="thumbnailImage"
                className="flex items-center gap-3"
              >
                <img
                  src={assets.file_upload_icon}
                  alt="file_upload_icon"
                  className="p-3 bg-blue-500 rounded"
                />
                <input
                  type="file"
                  id="thumbnailImage"
                  onChange={(e) => setImage(e.target.files[0])}
                  accept="image/*"
                  hidden
                />
                <img
                  src={image ? URL.createObjectURL(image) : null}
                  alt=""
                  className="max-h-10"
                />
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p>Discount %</p>
            <input
              type="number"
              placeholder="0"
              onChange={(e) => setDiscount(e.target.value)}
              value={discount}
              min={0}
              max={100}
              className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <p>Discount End Date</p>
            <input
              type="date"
              onChange={(e) => setDiscountEndDate(e.target.value)}
              value={discountEndDate}
              className="outline-none md:py-2.5 py-2 w-36 px-3 rounded border border-gray-500"
              required
            />
          </div>
          {/* adding chapter and lecture */}
          <div>
            {chapters.map((chapter, chapterIndex) => (
              <div
                key={chapterIndex}
                className="bg-white border rounded-lg mb-4"
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="flex items-center">
                    <img
                      onClick={() => handleChapter("toogle", chapter.chapterId)}
                      src={assets.dropdown_icon}
                      alt="dropdown_icon"
                      width={14}
                      className={`mr-2 cursor-pointer transition-all ${
                        chapter.collapsed && "-rotate-90"
                      }`}
                    />
                    <span className="font-semibold">
                      {chapterIndex + 1}. {chapter.chapterTitle}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {chapter.chapterContent.length} Lectures
                  </span>
                  <img
                    onClick={() => handleChapter("remove", chapter.chapterId)}
                    src={assets.cross_icon}
                    alt="cross_icon"
                    className="cursor-pointer"
                  />
                </div>
                {!chapter.collapsed && (
                  <div className="p-4">
                    {chapter.chapterContent.map((lecture, lectureIndex) => (
                      <div
                        key={lectureIndex}
                        className="flex justify-between items-center mb-2"
                      >
                        <span>
                          {lectureIndex + 1}. {lecture.lectureTitle} -{" "}
                          {lecture.lectureDuration} mins -{" "}
                          <a
                            href={lecture.lectureUrl}
                            target="_blank"
                            className="text-blue-500"
                          >
                            Link
                          </a>{" "}
                          - {lecture.isPreviewFree ? "Free Preview" : "Paid"}
                        </span>
                        <img
                          onClick={() =>
                            handleLecture(
                              "remove",
                              chapter.chapterId,
                              lectureIndex
                            )
                          }
                          src={assets.cross_icon}
                          alt="cross_icon"
                          className="cursor-pointer"
                        />
                      </div>
                    ))}
                    <div
                      onClick={() => handleLecture("add", chapter.chapterId)}
                      className="inline-flex bg-gray-200 p-2 rounded cursor-pointer mt-2"
                    >
                      + Add Lecture
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div
              onClick={() => handleChapter("add")}
              className="flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer"
            >
              + Add Chapter
            </div>
            {showPopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="bg-white p-4 rounded-lg text-gray-700 relative w-full max-w-xl">
                  <h2 className="text-lg font-semibold mb-4">Add Lecture</h2>
                  <div className="mb-2">
                    <p>Lecture Title</p>
                    <input
                      type="text"
                      className="mt-1 block w-full border rounded py-1 px-2"
                      value={lectureDetails.lectureTitle}
                      onChange={(e) =>
                        setLectureDetails({
                          ...lectureDetails,
                          lectureTitle: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <p>Duration (minutes)</p>
                    <input
                      type="number"
                      className="mt-1 block w-full border rounded py-1 px-2"
                      value={lectureDetails.lectureDuration}
                      onChange={(e) =>
                        setLectureDetails({
                          ...lectureDetails,
                          lectureDuration: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <p>Lecture URL</p>
                    <input
                      type="text"
                      className="mt-1 block w-full border rounded py-1 px-2"
                      value={lectureDetails.lectureUrl}
                      onChange={(e) =>
                        setLectureDetails({
                          ...lectureDetails,
                          lectureUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-2 my-4">
                    <p>Is Preview Free?</p>
                    <input
                      type="checkbox"
                      className="mt-1 scale-125"
                      checked={lectureDetails.isPreviewFree}
                      onChange={(e) =>
                        setLectureDetails({
                          ...lectureDetails,
                          isPreviewFree: e.target.checked,
                        })
                      }
                    />
                  </div>
                  <button
                    onClick={addLecture}
                    type="button"
                    className="w-full bg-blue-400 text-white px-4 py-2 rounded"
                  >
                    Add
                  </button>
                  <img
                    onClick={() => setShowPopup(false)}
                    src={assets.cross_icon}
                    alt="cross_icon"
                    className="absolute  top-4 right-4 w-4 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
          <button
            disabled={loading}
            type="submit"
            className="bg-black text-white w-max py-2.5 px-8 rounded my-4"
          >
            ADD
          </button>
        </form>
      </div>
    </>
  );
};

export default AddCourse;
