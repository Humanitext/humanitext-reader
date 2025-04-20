<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {

    // sparql endpointから取得した地域名のリスト
    const endpoint = "http://54.92.185.36:3030/humanitext_reader/sparql";
    //const endpoint = "https://dydra.com/junjun7613/humanitextonto/sparql";
    const query = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT DISTINCT ?region WHERE {
        ?sub a <http://example.org/vocabulary/Commentary> .
        ?sub <http://example.org/vocabulary/hasRegion> ?region .
      }
    `;
    const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;
    const regions = ref([]);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        data.results.bindings.forEach((binding) => {
          regions.value.push(binding.region.value);
        });
      });

    //const regions = ref(["北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州"]);
    const selectedRegion = ref("all");
    const router = useRouter();

    const handleConfirm = () => {
      if (selectedRegion.value !== "all") {
        //home/region/selectedRegion.valueに遷移
        //navigateTo(`details/${selectedRegion.value}`);
        router.push(`details/${selectedRegion.value}`);
      }
    };

    return {
      regions,
      selectedRegion,
      handleConfirm
    };
  }
};
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="6">
          <div class="selectTheme">
            <label for="region">地域を選択してください</label>
            <select id="region" v-model="selectedRegion">
              <option value="all"> </option>
              <option v-for="region in regions" :value="region">{{ region }}</option>
            </select>
            <p>選択中の地域: {{ selectedRegion }}</p>
            <button style="border: 5px;" @click="handleConfirm">
              確定</button>
          </div>
      </v-col>
      <v-col cols="12" md="6">
        
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.selectTheme {
  color: black;
  font-size: 24px;
  text-align: left;
  font-family: Georgia, 'Times New Roman', Times, serif;
}
</style>