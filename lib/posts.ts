import fs from "fs";
import path from "path";
import matter from "gray-matter";
import remark from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "posts");

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  //投稿のメタデータを解析するためにgray-matterを使う
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);

  const contentHtml = processedContent.toString();

  return {
    id,
    contentHtml,
    ...(matterResult.data as { date: string; title: string })
  };
}

export function getSortedPostsData() {
  // /posts 配下のファイル名を取得する
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostData = fileNames.map(fileName => {
    // idを取得するためにファイル名から".md"を削除する
    const id = fileName.replace(/\.md$/, "");

    //マークダウンファイルを文字列として読み取る
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    //投稿のメタデータを解析するためにgray-matterを使う
    const matterResult = matter(fileContents);

    //データをidと合わせる
    return {
      id,
      ...(matterResult.data as { date: string; title: string })
    };
  });
  //投稿を日付をソートする
  return allPostData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, "")
      }
    };
  });
}
