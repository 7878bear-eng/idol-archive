import {

doc,
setDoc,
deleteDoc,
onSnapshot,
collection

}

from
"firebase/firestore";
import { db } from "./firebase";


import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Film } from "lucide-react";

export default function App() {
  const [openSettings,
setOpenSettings] =
useState(false);
  const [viewMode, setViewMode] = useState("year");
  const [

showFavorites,

setShowFavorites

]

=

useState(
false
);
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [idolName, setIdolName] = useState("");
  const [mvTitle, setMvTitle] = useState("");
  const [albumName, setAlbumName] = useState("");
  const [mvDate, setMvDate] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(5);
  const [favorite, setFavorite] = useState(false);
  const [colorTag, setColorTag] = useState("");
  const [conceptTag, setConceptTag] = useState("");
  const [image, setImage] = useState("");
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] =
  useState(false);
  

 useEffect(() => {
  const saved = localStorage.getItem("mv-entries");

  if (saved) {
    setEntries(JSON.parse(saved));
  }

  setLoaded(true);
}, []);

useEffect(() => {
  if (!loaded) return;

  localStorage.setItem(
    "mv-entries",
    JSON.stringify(entries)
  );
}, [entries, loaded]);

useEffect(() => {

  const unsubscribe =
  onSnapshot(

    collection(
      db,
      "mv-entries"
    ),

    (snapshot)=>{

      console.log(
        "불러온 문서",
        snapshot.docs.length
      );

      const data =
      snapshot.docs.map(
        (document)=>({

          ...document.data(),

          id:
          document.id,

        })
      );

      console.log(data);

      setEntries(
        data
      );

    }

  );

  return () =>
  unsubscribe();

}, []);


  const filteredEntries = entries.filter((entry) => {
    const keyword = search.toLowerCase();
    const searchableText = `
      ${entry.idol || ""}
      ${entry.mv || ""}
      ${entry.album || ""}
      ${entry.date || ""}
      ${entry.note || ""}
      ${entry.colorTag || ""}
      ${entry.conceptTag || ""}
      ${(entry.tracks || [])
  .map((track) =>
    typeof track === "string"
      ? track
      : `${track.title || ""} ${track.link || ""} ${track.memo || ""}`
  )
  .join(" ")}
    `.toLowerCase();

    return searchableText.includes(keyword);
  });

  const groupedByYear = useMemo(() => {
    const grouped = {};

    filteredEntries.forEach((entry) => {
      const year = entry.date?.split("-")[0] || "Unknown";
      const day = entry.date || "날짜 없음";
      const album = entry.album || "No Album";

      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][day]) grouped[year][day] = {};
      if (!grouped[year][day][album]) grouped[year][day][album] = [];

      grouped[year][day][album].push(entry);
    });

    return grouped;
  }, [filteredEntries]);

  const groupedByIdol = useMemo(() => {
    const grouped = {};

    filteredEntries.forEach((entry) => {
      const idol = entry.idol || "Unknown";
      const first = idol[0]?.toUpperCase() || "#";
      const key = /[가-힣]/.test(first) || /[A-Z]/.test(first) ? first : "#";

      if (!grouped[key]) grouped[key] = {};
      if (!grouped[key][idol]) grouped[key][idol] = [];

      grouped[key][idol].push(entry);
    });

    return grouped;
  }, [filteredEntries]);

  const resetForm = () => {
    setEditingId(null);
    setIdolName("");
    setMvTitle("");
    setAlbumName("");
    setMvDate("");
    setYoutubeLink("");
    setNote("");
    setRating(5);
    setFavorite(false);
    setColorTag("");
    setConceptTag("");
    setImage("");
  };

  const addMvToAlbum = async (albumInfo, mvData) => {
  const newEntry = {
    id: Date.now(),
    idol: albumInfo.idol,
    album: albumInfo.album,
    date: albumInfo.date,
    mv: mvData.mv,
    youtube: mvData.youtube,
    note: mvData.note,
    rating: 5,
    favorite: false,
    colorTag: "",
    conceptTag: "",
    image: "",
    tracks: albumInfo.tracks || [],
  };

  await setDoc(
    doc(db, "mv-entries", String(newEntry.id)),
    newEntry
  );
};
  const addEntry = async () => {

  if (!idolName || !mvTitle)
    return;

  const newEntry = {
    id:
      editingId ||
      Date.now(),

    idol:
      idolName,

    mv:
      mvTitle,

    album:
      albumName,

    date:
      mvDate,

    youtube:
      youtubeLink.trim(),

    note,

    rating,

    favorite,

    colorTag,

    conceptTag,

    image,

    tracks:
      editingId
      ? entries.find(
          (entry)=>
          entry.id===editingId
        )?.tracks || []
      : [],
  };


  await setDoc(

    doc(
      db,
      "mv-entries",
      String(
        newEntry.id
      )
    ),

    newEntry

  );


  resetForm();

  setOpenForm(false);

};
  const startEdit = (entry) => {
    setEditingId(entry.id);
    setIdolName(entry.idol || "");
    setMvTitle(entry.mv || "");
    setAlbumName(entry.album || "");
    setMvDate(entry.date || "");
    setYoutubeLink(entry.youtube || "");
    setNote(entry.note || "");
    setRating(entry.rating || 5);
    setFavorite(entry.favorite || false);
    setColorTag(entry.colorTag || "");
    setConceptTag(entry.conceptTag || "");
    setImage(entry.image || "");
    setOpenForm(true);
  };

  const deleteEntry = async (id) => {
  await deleteDoc(
    doc(
      db,
      "mv-entries",
      String(id)
    )
  );
};

  const addTrackToAlbum = (ids, newTrack) => {
    setEntries(
      entries.map((entry) =>
        ids.includes(entry.id)
          ? { ...entry, tracks: [...(entry.tracks || []), newTrack] }
          : entry
      )
    );
  };

  const updateAlbumMemo = (ids, memo) => {
  setEntries(
    entries.map((entry) =>
      ids.includes(entry.id)
        ? {
            ...entry,
            albumMemo: memo,
          }
        : entry
    )
  );
};
  const deleteTrack =
async (

entryId,

trackIndex

)=>{

const target =
entries.find(

(entry)=>

entry.id===entryId

);

if(!target)
return;


const updated = {

...target,

tracks:

(target.tracks || [])

.filter(

(_,
index)=>

index !==
trackIndex

),

};


await setDoc(

doc(

db,

"mv-entries",

String(
entryId
)

),

updated

);

};

  const changedEntries = updatedEntries.filter((entry) =>
    ids.includes(entry.id)
  );

  for (const entry of changedEntries) {
    await setDoc(
      doc(db, "mv-entries", String(entry.id)),
      entry
    );
  }
};

  
  const getAverageRating = (list) => {
    if (!list.length) return "0.0";
    return (
      list.reduce((sum, item) => sum + Number(item.rating || 0), 0) / list.length
    ).toFixed(1);
  };

  const EntryCard = ({ entry }) => (
  <div className="bg-zinc-800 rounded-2xl p-5">
    {entry.image && (
      <img
        src={entry.image}
        alt={entry.mv}
        className="w-full max-h-80 object-cover rounded-xl mb-4"
      />
    )}

    <div>

  <p className="
  text-zinc-400
  text-sm
  uppercase">

    {entry.idol}

  </p>


  <h3 className="
  text-3xl
  font-bold
  text-white">

    {entry.mv}

  </h3>

</div>

    <p className="text-xs text-zinc-500 mb-3">
  {entry.date}
</p>

    <div className="flex flex-wrap gap-2 mb-4">
      {entry.favorite && (
        <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
          ★ Favorite
        </span>
      )}

      {entry.colorTag && (
        <span className="bg-zinc-700 px-3 py-1 rounded-full text-sm">
          🎨 {entry.colorTag}
        </span>
      )}

      {entry.conceptTag && (
        <span className="bg-zinc-700 px-3 py-1 rounded-full text-sm">
          🏷 {entry.conceptTag}
        </span>
      )}

      <span className="
bg-zinc-700
px-2
py-1
rounded-full
text-xs
text-zinc-300">

⭐ {entry.rating}

</span>
    </div>

    <details className="mt-4">
      <summary className="cursor-pointer text-white font-medium">
        📝 메모 보기
      </summary>

      <textarea
        value={entry.note || ""}
        onChange={(e) => {
          setEntries(
            entries.map((item) =>
              item.id === entry.id
                ? {
                    ...item,
                    note: e.target.value,
                  }
                : item
            )
          );
        }}
        className="w-full bg-zinc-900 text-white rounded-xl p-3 min-h-[120px] mt-3"
      />
    </details>

    <div className="flex gap-2 mt-5">
      <button
        onClick={() => startEdit(entry)}
        className="bg-white text-black px-4 py-2 rounded-xl"
      >
        수정
      </button>

      <button
        onClick={() => deleteEntry(entry.id)}
        className="bg-red-500 text-white px-4 py-2 rounded-xl"
      >
        삭제
      </button>
    </div>

    {entry.youtube && (
      <a
        href={entry.youtube}
        target="_blank"
        rel="noreferrer"
        className="text-cyan-400 underline block mt-4"
      >
        ▶ 유튜브 열기
      </a>
    )}
  </div>
);

  const updateTrackInAlbum = (ids, trackIndex, updatedTrack) => {
  setEntries(
    entries.map((entry) =>
      ids.includes(entry.id)
        ? {
            ...entry,
            tracks: (entry.tracks || []).map((track, index) =>
              index === trackIndex ? updatedTrack : track
            ),
          }
        : entry
    )
  );
};

const moveTrackInAlbum = (ids, trackIndex, direction) => {
  setEntries(
    entries.map((entry) => {
      if (!ids.includes(entry.id)) return entry;

      const updatedTracks = [...(entry.tracks || [])];
      const targetIndex = trackIndex + direction;

      if (
        targetIndex < 0 ||
        targetIndex >= updatedTracks.length
      ) {
        return entry;
      }

      const temp = updatedTracks[trackIndex];
      updatedTracks[trackIndex] = updatedTracks[targetIndex];
      updatedTracks[targetIndex] = temp;

      return {
        ...entry,
        tracks: updatedTracks,
      };
    })
  );
};
  const AlbumTrackEditor = ({ tracks = [], onAdd, onDelete, onUpdate, onMove }) => {
  const AlbumMvAdder = ({ albumInfo, onAdd }) => {
  const [mv, setMv] = useState("");
  const [youtube, setYoutube] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="bg-black rounded-xl p-4 mb-5">
      <p className="text-zinc-400 text-sm mb-3">
        MV 추가
      </p>

      <div className="flex flex-col gap-3">
        <input
          value={mv}
          onChange={(e) => setMv(e.target.value)}
          placeholder="뮤직비디오 제목"
          className="bg-zinc-900 p-3 rounded-xl"
        />

        <textarea
          value={youtube}
          onChange={(e) => setYoutube(e.target.value)}
          placeholder="유튜브 링크"
          className="bg-zinc-900 p-3 rounded-xl min-h-[70px]"
        />

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="MV 메모"
          className="bg-zinc-900 p-3 rounded-xl min-h-[100px]"
        />

        <button
          onClick={() => {
            if (!mv.trim()) return;

            onAdd({
              mv,
              youtube,
              note,
            });

            setMv("");
            setYoutube("");
            setNote("");
          }}
          className="bg-white text-black px-4 py-3 rounded-xl"
        >
          MV 추가
        </button>
      </div>
    </div>
  );
};
    const [newTrack, setNewTrack] = useState("");
  const [newTrackLink, setNewTrackLink] = useState("");

  return (
    <div className="mt-4 mb-5 bg-[#111111] rounded-xl p-4">
      <p className="text-zinc-400 text-sm mb-2">
        TRACK LIST ({tracks.length}/20)
      </p>

      <div className="flex flex-col gap-2 mb-4">
        <input
          value={newTrack}
          onChange={(e) => setNewTrack(e.target.value)}
          placeholder="수록곡 제목"
          className="bg-[#1a1a1a] p-3 rounded-xl"
        />

        <input
          value={newTrackLink}
          onChange={(e) => setNewTrackLink(e.target.value)}
          placeholder="수록곡 링크"
          className="bg-[#1a1a1a] p-3 rounded-xl"
        />

        <button
          type="button"
          onClick={() => {
            if (!newTrack.trim()) return;

            if (tracks.length >= 20) {
              alert("수록곡은 최대 20개까지 가능합니다.");
              return;
            }

            onAdd({
  title: newTrack,
  link: newTrackLink,
  memo: "",
});

            setNewTrack("");
            setNewTrackLink("");
          }}
          className="bg-white text-black px-4 py-3 rounded-xl"
        >
          수록곡 추가
        </button>
      </div>

      <div className="space-y-2">
        {tracks.map((track, i) => {
          const title =
            typeof track === "string"
              ? track
              : track?.title || "";

          const link =
            typeof track === "string"
              ? ""
              : track?.link || "";

          return (
            <div
              key={i}
              className="bg-[#1a1a1a] px-4 py-3 rounded-xl space-y-3"
            >
              <textarea
value={
typeof track === "string"
? ""
: track.memo || ""
}

onChange={(e)=>{

const updatedTrack = {
...track,
memo:e.target.value
};

onUpdate(
i,
updatedTrack
);

}}

placeholder="
수록곡 메모
(가사, 분위기,
인트로, 연결성...)"

className="
w-full
bg-[#111111]
rounded-xl
p-3
mt-3
min-h-[80px]"
/>

              <div className="flex items-center gap-3">
                <span className="text-zinc-300 w-8 text-right font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <input
                  value={title}
                  onChange={(e) =>
                    onUpdate(
i,
{
...track,
title:
e.target.value
}
)
                  }
                  className="bg-[#111111] p-2 rounded-xl flex-1"
                />
              </div>

              <div className="flex items-center gap-3 ml-11">
                <input
                  value={link}
                  onChange={(e) =>
                    onUpdate(i, {
                      title,
                      link: e.target.value,
                    })
                  }
                  placeholder="링크"
                  className="bg-[#111111] p-2 rounded-xl flex-1"
                />

                <button
                  onClick={() => onMove(i, -1)}
                  disabled={i === 0}
                  className="bg-zinc-800 px-3 py-2 rounded-xl disabled:opacity-30"
                >
                  ↑
                </button>

                <button
                  onClick={() => onMove(i, 1)}
                  disabled={i === tracks.length - 1}
                  className="bg-zinc-800 px-3 py-2 rounded-xl disabled:opacity-30"
                >
                  ↓
                </button>

                <button
                  onClick={() => onDelete(i)}
                  className="text-red-400 text-sm"
                >
                  삭제
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

  return (
    <main className="min-h-screen bg-[#111111] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Film className="w-8 h-8" />
            <div>
              <h1 className="text-6xl font-extrabold tracking-tight">MV Archive</h1>
              <p className="text-gray-400">아이돌 MV 연구 아카이브</p>
            </div>
          </div>

          <button
            onClick={() => setOpenForm(!openForm)}
            className="bg-white text-black px-4 py-2 rounded-xl font-bold"
          >
            +
          </button>
        </div>

        {openForm && (
          <section className="bg-[#1a1a1a] rounded-2xl p-5 mb-8">
            <div className="flex flex-col gap-4">
              <input
                placeholder="아이돌 이름"
                value={idolName}
                onChange={(e) => setIdolName(e.target.value)}
                className="bg-zinc-800 p-3 rounded-xl"
              />

              <input
                placeholder="뮤직비디오 제목"
                value={mvTitle}
                onChange={(e) => setMvTitle(e.target.value)}
                className="bg-zinc-800 p-3 rounded-xl"
              />

              <input
                placeholder="앨범 이름"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                className="bg-zinc-800 p-3 rounded-xl"
              />

              <input
                type="date"
                value={mvDate}
                onChange={(e) => setMvDate(e.target.value)}
                className="bg-zinc-800 p-3 rounded-xl"
              />

              <textarea
                placeholder="유튜브 링크"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                className="bg-zinc-800 p-4 rounded-xl min-h-[80px]"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = () => setImage(reader.result);
                  reader.readAsDataURL(file);
                }}
                className="bg-zinc-800 p-3 rounded-xl"
              />

              {image && (
                <img
                  src={image}
                  alt="preview"
                  className="w-full max-h-80 object-cover rounded-xl"
                />
              )}

              <select
                value={colorTag}
                onChange={(e) => setColorTag(e.target.value)}
                className="bg-zinc-800 p-3 rounded-xl"
              >
                <option value="">대표 색감</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="Pink">Pink</option>
                <option value="Black">Black</option>
                <option value="White">White</option>
                <option value="Neon">Neon</option>
              </select>

              <input
                placeholder="컨셉 태그"
                value={conceptTag}
                onChange={(e) => setConceptTag(e.target.value)}
                className="bg-zinc-800 p-3 rounded-xl"
              />

              <label className="flex items-center gap-2 bg-zinc-800 p-3 rounded-xl">
                <input
                  type="checkbox"
                  checked={favorite}
                  onChange={(e) => setFavorite(e.target.checked)}
                />
                즐겨찾기
              </label>

              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="bg-zinc-800 p-3 rounded-xl"
              />

              <textarea
                placeholder="MV 분석 메모"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-zinc-800 p-3 rounded-xl min-h-[120px]"
              />
            </div>

            <button
              onClick={addEntry}
              className="mt-4 bg-white text-black px-5 py-3 rounded-xl font-bold flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {editingId ? "수정 완료" : "추가하기"}
            </button>
          </section>
        )}

        <div className="flex gap-3 mb-5">
          <button
onClick={() =>
setOpenSettings(
!openSettings
)
}

className="
bg-zinc-800
px-4
py-2
rounded-xl"
>

⚙️ Settings

</button>
          <button
            onClick={() => setViewMode("year")}
            className={`px-4 py-2 rounded-xl ${
              viewMode === "year" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            년도별 보기
          </button>
          

          <button
            onClick={() => setViewMode("idol")}
            className={`px-4 py-2 rounded-xl ${
              viewMode === "idol" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            아이돌별 보기
          </button>
          <button
  onClick={() =>
    setShowFavorites(!showFavorites)
  }
  className={`px-4 py-2 rounded-xl ${
    showFavorites
      ? "bg-yellow-400 text-black"
      : "bg-zinc-800 text-white"
  }`}
>
  ⭐ 즐겨찾기
</button>
          
          <button
onClick={() => {

const data =
JSON.stringify(
entries,
null,
2
);

const blob =
new Blob(
[data],
{
type:
"application/json"
}
);

const url =
URL.createObjectURL(
blob
);

const a =
document.createElement(
"a"
);

a.href=url;

a.download=
"mv-archive.json";

a.click();

}}

className="
bg-zinc-800
px-4
py-2
rounded-xl"
>

백업

</button>
        </div>

        {openSettings && (

<div className="
bg-[#1a1a1a]
rounded-2xl
p-5
mb-6
space-y-4">

<h2 className="
text-2xl
font-bold">

⚙️ Settings

</h2>


<button

onClick={()=>{

const data =
JSON.stringify(
entries,
null,
2
);

const blob =
new Blob(
[data],
{
type:
"application/json"
}
);

const url =
URL.createObjectURL(
blob
);

const a =
document.createElement(
"a"
);

a.href=url;

a.download=
"mv-archive.json";

a.click();

}}

className="
bg-white
text-black
px-4
py-3
rounded-xl">

데이터 내보내기

</button>



<input

type="file"

accept=".json"

onChange={(e)=>{

const file =
e.target.files[0];

if(!file)
return;

const reader =
new FileReader();

reader.onload =
(event)=>{

const imported =
JSON.parse(
event.target.result
);

setEntries(
imported
);

};

reader.readAsText(
file
);

}}

className="
bg-zinc-800
p-3
rounded-xl
block"
/>

</div>

)}
        <section className="mb-8">
          <div className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center gap-3">
            <Search className="w-5 h-5" />
            <input
              placeholder="아이돌, 앨범, MV, 태그, 메모, 수록곡 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full"
            />
          </div>
        </section>

        <section className="space-y-10">
          {viewMode === "year" &&
            Object.entries(groupedByYear).map(([year, days]) => (
              <div key={year}>
                <h2 className="text-4xl font-bold mb-5">{year}</h2>

                <div className="space-y-5">
                  {Object.entries(days).map(([day, albums]) => (
                    <div key={day}>
                      <h3 className="text-2xl font-semibold mb-4">📅 {day}</h3>

                      <div className="space-y-4">
                        {Object.entries(albums).map(([album, mvs]) => {
                          const albumIds = mvs.map((entry) => entry.id);
                          const albumTracks = mvs[0]?.tracks || [];

                          return (
                            <details key={album} className="bg-zinc-900 rounded-2xl p-5">
                              <summary className="cursor-pointer text-xl font-semibold">
                                <div className="
text-2xl
font-bold">

💿 {album}

</div>
                                <span className="ml-3 text-sm text-zinc-400">
                                  ⭐ {getAverageRating(mvs)}
                                </span>
                              </summary>

                              <textarea
  value={mvs[0]?.albumMemo || ""}
  onChange={(e) =>
    updateAlbumMemo(albumIds, e.target.value)
  }
  placeholder="앨범 전체 메모 / 컨셉 / 색감 / 수록곡 흐름 기록"
  className="w-full bg-[#111111] rounded-xl p-3 min-h-[100px] mt-4 mb-4"
/>
                              <AlbumTrackEditor
  tracks={albumTracks}
  
  onAdd={(track) => addTrackToAlbum(albumIds, track)}
  onDelete={(index) =>
  deleteTrackFromAlbum(albumIds, index)
}
  onUpdate={(index, track) => updateTrackInAlbum(albumIds, index, track)}
  onMove={(index, direction) => moveTrackInAlbum(albumIds, index, direction)}
/>
<AlbumMvAdder
  albumInfo={{
    idol: mvs[0]?.idol || "",
    album,
    date: mvs[0]?.date || "",
    tracks: albumTracks,
  }}
  onAdd={(mvData) =>
    addMvToAlbum(
      {
        idol: mvs[0]?.idol || "",
        album,
        date: mvs[0]?.date || "",
        tracks: albumTracks,
      },
      mvData
    )
  }
/>

                              <div className="flex flex-col gap-4 mt-5">
                               {mvs

.filter(

(entry)=>

showFavorites

? entry.favorite

: true

)

.map((entry)=>(

<EntryCard

key={entry.id}

entry={entry}

/>

))

}
                              </div>
                            </details>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {viewMode === "idol" &&
            Object.entries(groupedByIdol)
              .sort()
              .map(([letter, idols]) => (
                <div key={letter}>
                  <h2 className="text-4xl font-bold mb-5">{letter}</h2>

                  <div className="space-y-5">
                    {Object.entries(idols)
                      .sort()
                      .map(([idol, mvs]) => (
                        <details open key={idol} className="bg-zinc-900 rounded-2xl p-5">
                          <summary className="cursor-pointer text-2xl font-semibold">
                            {idol}
                            <span className="ml-3 text-sm text-zinc-400">
                              ⭐ {getAverageRating(mvs)}
                            </span>
                          </summary>

                          <div className="flex flex-col gap-4 mt-5">
                            {mvs.map((entry) => (
                              <EntryCard key={entry.id} entry={entry} />
                            ))}
                          </div>
                        </details>
                      ))}
                  </div>
                </div>
              ))}
        </section>
      </div>
    </main>
  );
