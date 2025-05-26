<template>
    <section class="modal-checklist">
        <h5></h5>
        <label for="checklist-input">Title</label>
        <input type="text" v-model="checklistTitle" placeholder="Checklist" v-focus />
        <!-- placeholder="Checklist" v-focus id="checklist-input" /> -->

        <!-- <label for="checklist-copy">Copy item from...</label>
        <form>
            <select id="copyItem">
                <option> (none) </option>
                <option> just </option>
                <option> for </option>
                <option> now </option>
            </select>
        </form> -->
        <button class="add-checklist" @click="addCheckList">Add</button>
    </section>
</template>

<script>
import { utilService } from '../../services/util.service.js'

export default {
    data() {
        return {
            checklistTitle: ''
        }
    },
    methods: {
        addCheckList() {
            // check how to continue writing on place holder input
            if (!this.checklistTitle) this.checklistTitle = 'Checklist'

            const newChecklist = {
                _id: utilService.makeId(),
                title: this.checklistTitle,
                todos: []
            }
            this.$emit('checklist', newChecklist)
            console.log('modal1 - newChecklist:', newChecklist)
        }
    }
}
</script>