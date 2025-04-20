<template>
    <v-container fluid>
    <h1 class="header">Selected Book: {{ route.params.book }}</h1>
    <v-row>
      <v-col cols="12" md="6" class="scrollable">
        <!--textsの要素ごとに表示-->
        <v-card v-for="text in texts" :key="text.line">
          <!--text.commentaryが存在する場合にはtextClicked関数を実行-->
          <v-card-title 
            v-if="text.commentary.length > 0"
            @click="textClicked(text.commentary)"
            style="
              color: blue;
              font-family: Georgia, 'Times New Roman', Times, serif;
              font-size: 14px;
              "
            >
            {{ text.line }}
          </v-card-title>
          <v-card-title 
            v-else
            style="
              font-family: Georgia, 'Times New Roman', Times, serif;
              font-size: 14px;
              "
            >
            {{ text.line }}
          </v-card-title>
          <v-card-text
            style="
              font-family: Georgia, 'Times New Roman', Times, serif;
              font-size: 20px;
              "
          >{{ text.description }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" class="scrollable">
        <!--commentary_listが存在する場合には、commentary_list内のcommentaryをループ処理-->
        <div v-if="commentary_list">
          <v-card 
            v-for="commentary in commentary_list" 
            :key="commentary.description"
            style="
              overflow: visible;
              margin-bottom: 20px;
              "
            >
            <v-card-title
              style="
                font-family: Georgia, 'Times New Roman', Times, serif;
                font-size: 24px;
              "
            >
              <p>{{commentary.annotator}}: </p>
              <p>{{commentary.book}}</p>
            </v-card-title>
            <v-card-text
              style="
                font-family: Georgia, 'Times New Roman', Times, serif;
                font-size: 18px;
              "
            >
              {{commentary.description}}
            </v-card-text>
            <div class="action-container">
            <treeselect
              :multiple="false"
              :options="options"
              placeholder="Select a language"
              v-model="lang"
              menu-placement="top"
              class="mb-4 treeselect"
              style="
                font-size: 18px;
                margin-bottom: 10px;
                margin-left: 20px;
                width: 400px;
                bottom: 100% !important; /* 選択肢を入力欄の上に表示 */
              "
            />
            <v-btn
              color="primary"
              @click="commentaryTranslate(commentary.description)"
              style="
                font-family: Georgia, 'Times New Roman', Times, serif;
                font-size: 18px;
                margin-bottom: 15px;
                margin-left: 20px;
              "
            >
              Translation
            </v-btn>
            <v-btn
              color="primary"
              @click="commentarySummarize(commentary.description)"
              style="
                font-family: Georgia, 'Times New Roman', Times, serif;
                font-size: 18px;
                margin-bottom: 15px;
                margin-left: 10px;
              "
            >
              Summary
            </v-btn>
          </div>
          </v-card>
      </div>
      <div v-else>
        <v-card>
          <v-card-title
            style="
              font-family: Georgia, 'Times New Roman', Times, serif;
              font-size: 24px;
            "
          >
            Commentary
          </v-card-title>
          <v-card-text
            style="
              font-family: Georgia, 'Times New Roman', Times, serif;
              font-size: 18px;
            "
          >
            No commentary available.
          </v-card-text>
        </v-card>
      </div>
      </v-col>
    </v-row>

    <v-dialog v-model="isTransSummDialogOpen" max-width="600px">
      <v-card :draggable="true">
        <v-card-title class="headline">Translation/Summary</v-card-title>
        <v-card-text>
              <p>{{ processedText }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="isTransSummDialogOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { GoogleGenAI } from "@google/genai";

import Treeselect from "vue3-treeselect";
import "vue3-treeselect/dist/vue3-treeselect.css";

const genAI = new GoogleGenAI({
        //apiKey: process.env.GOOGLE_GENAI_API_KEY
        apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY // 環境変数から API キーを読み込む
      });

export default {
  components: {
    Treeselect
  },
  setup() {
    //const works = ref(["Politics", "Metaphysics", "De Bello Gallico"]);
    const route = useRoute();
    const router = useRouter();
    const texts = ref([]);
    const textCommentaryPair = ref([]);
    const commentary = ref('');
    const commentaryContent = ref('');
    const commentaryAuthor = ref('');
    const commentaryWork = ref('');
    const commentary_list = ref([]);

    const lang = ref('Japanese');

    const options = ref([
      { id: 'Japanese', label: 'Japanese' },
      { id: 'English', label: 'English' },
      { id: 'French', label: 'French' },
      { id: 'Chinese', label: 'Chinese' },
      { id: 'Spanish', label: 'Spanish' },
      { id: 'Italian', label: 'Italian' },
      { id: 'German', label: 'German' },
      { id: 'Russian', label: 'Russian' },
      { id: 'Greek', label: 'Greek' },
      { id: 'Latin', label: 'Latin' }
    ]);

    const processedText = ref('');
    const isTransSummDialogOpen = ref(false);

    const endpoint = "http://54.92.185.36:3030/humanitext_reader/sparql";
    //const endpoint = "https://dydra.com/junjun7613/humanitextonto/sparql";
    const query = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT ?text ?line ?description ?commentary WHERE {
          ?author a <http://example.org/vocabulary/Author> ;
                  rdfs:label "${route.params.author}" .
          ?work a <http://example.org/vocabulary/Work> ;
                  rdfs:label "${route.params.work}" ;
                  <http://purl.org/dc/elements/1.1/creator> ?author .
          ?text a <http://example.org/vocabulary/Text>;
              <http://example.org/vocabulary/textIndex> ?index ;
              <http://example.org/vocabulary/correspondingWork> ?work ;
              <http://example.org/vocabulary/correspondingBook> "${route.params.book}" ;
              <http://purl.org/dc/elements/1.1/creator> ?author.
          ?text <http://example.org/vocabulary/correspondingSeg> ?line;
              <http://purl.org/dc/elements/1.1/description> ?description.

          OPTIONAL{?commentary <http://example.org/vocabulary/references> ?text}
        }
        ORDER BY ?index
    `;
    const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log(data);
        data.results.bindings.forEach((binding) => {
          //もし既存のtexts.valueに含まれる連想配列にlineが存在すれば、その連想配列にcommentaryを追加
          const existingText = texts.value.find((text) => text.line === binding.line.value);
          console.log(existingText);
          if (existingText) {
            existingText.commentary.push(binding.commentary ? binding.commentary.value : null);
            //変更を反映してtexts.valueを更新
            texts.value = [...texts.value];
          } else {
            //console.log("no existing text");
            texts.value.push({
            line: binding.line.value,
            description: binding.description.value,
            //もしcommentaryが存在すれば新たに連想配列を作成し、texts.valueに追加
            commentary: binding.commentary ? [binding.commentary.value] : []
          });
        };
        });
      });

    console.log(texts.value);
    // 現状では、一つの行に対して複数の注釈が存在する場合、インターフェイス上では同じ行が複数回表示されてしまう

    const textClicked = (commentaryText) => {
      commentary_list.value = [];
      const endpoint = "http://54.92.185.36:3030/humanitext_reader/sparql";

      for (const commentary of commentaryText) {

        const query = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

            SELECT DISTINCT ?description ?annotator ?book WHERE {
            <${commentary}> <http://purl.org/dc/elements/1.1/description> ?description ;
              <http://purl.org/dc/elements/1.1/creator> ?annotator ;
              <http://example.org/vocabulary/correspondingBook> ?book .

            }
        `;
        const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;
        fetch(url)
          .then(res => res.json())
          .then(data => {
            console.log(data);
            data.results.bindings.forEach((binding) => {
              commentary_list.value.push({
                description: binding.description.value,
                annotator: binding.annotator.value,
                book: binding.book.value
              });
              //commentaryContent.value = binding.description.value;
              //commentaryAuthor.value = binding.annotator.value;
              //commentaryWork.value = binding.book.value;
            });
          });

      }

      //commentary.value = commentaryText;
      //router.push(`/details/${route.params.region}/${route.params.author}/${route.params.work}/${commentary}`);
    };  

    // Google GenAIによる処理
    const LLMProcess = async (text, mode) => {
      try {
        let prompt = '';
        if (mode === "translate") {
          prompt = `Translate the following text to ${lang.value}: ${text}`;
        } else if (mode === "summarize") {
          prompt = `Briefly summarize the following text in ${lang.value}: ${text}`;
        }

        const response = await genAI.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          temperature: 0.5
        });

        if (!response || !response.text) {
          throw new Error("No response from the API");
        }

        return response.text;
      } catch (error) {
        console.error("Error in LLMProcess:", error);
        alert("Failed to process the text. Please try again.");
        return '';
      }
    };

    // コメンタリーの内容を翻訳する
    const commentaryTranslate = (commentaryDesc) => {
      //console.log(commentaryDesc);
      LLMProcess(commentaryDesc, "translate").then((translatedText) => {
        //console.log(translatedText);
        if (translatedText) {
          processedText.value = translatedText;
          isTransSummDialogOpen.value = true; // ダイアログを開く
        }
        console.log(isTransSummDialogOpen.value);
        console.log(processedText.value);
      });
    };

    // コメンタリーの内容を要約する
    const commentarySummarize = (commentaryDesc) => {
      //console.log(commentaryDesc);
      LLMProcess(commentaryDesc, "summarize").then((summarizedText) => {
        //console.log(summarizedText);
        if (summarizedText) {
          processedText.value = summarizedText;
          isTransSummDialogOpen.value = true; // ダイアログを開く
        }
        console.log(processedText.value);
        console.log(isTransSummDialogOpen.value);
      });
    }

    return {
      options,
      lang,
      route,
      texts,
      //commentary,
      //commentaryContent,
      //commentaryAuthor,
      //commentaryWork,
      textClicked,
      commentaryTranslate,
      commentarySummarize,
      commentary_list,
      processedText,
      isTransSummDialogOpen,
      LLMProcess,
    };
  }

};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Greek&display=swap');
.greek-text {
  font-family: 'Noto Sans Greek', sans-serif;
}
.scrollable {
  margin-top: 10px;
  max-height: 800px; /* 必要に応じて高さを調整 */
  overflow-y: auto;
}
.selectTheme {
  color: black;
  font-size: 24px;
  text-align: left;
  font-family: Georgia, 'Times New Roman', Times, serif;
}
.header {
  font-family: Georgia, 'Times New Roman', Times, serif;
}
.action-container {
  display: flex;
  align-items: center;
  gap: 5px; /* 要素間のスペース */
}
.treeselect {
  position: relative;
}

.treeselect__menu {
  position: absolute !important;
  bottom: 100% !important; /* 選択肢を入力欄の上に表示 */
  left: 0;
  z-index: 9999 !important; /* 他の要素に隠れないように調整 */
}
</style>