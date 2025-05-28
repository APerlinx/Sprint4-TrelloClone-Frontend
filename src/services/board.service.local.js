import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'
import { userService } from './user.service.js'

const STORAGE_KEY = 'board'

export const boardService = {
  query,
  getById,
  save,
  remove,
  getEmptyBoard,
  addBoardMsg,
  getEmptyGroup,
  getEmptyTask,
  getEmptyActivity,
}
window.cs = boardService

async function query(filterBy = { txt: '', price: 0 }) {
  var boards = await storageService.query(STORAGE_KEY)
  if (filterBy.txt) {
    const regex = new RegExp(filterBy.txt, 'i')
    boards = boards.filter(
      (board) => regex.test(board.title) || regex.test(board.description)
    )
  }
  if (filterBy.price) {
    boards = boards.filter((board) => board.price <= filterBy.price)
  }
  return boards
}

function getById(boardId) {
  return storageService.get(STORAGE_KEY, boardId)
}

async function remove(boardId) {
  await storageService.remove(STORAGE_KEY, boardId)
}

async function save(board) {
  var savedBoard
  if (board._id) {
    savedBoard = await storageService.put(STORAGE_KEY, board)
  } else {
    // Later, owner is set by the backend
    board.owner = userService.getLoggedinUser()
    savedBoard = await storageService.post(STORAGE_KEY, board)
  }
  return savedBoard
}

async function addBoardMsg(boardId, txt) {
  // Later, this is all done by the backend
  const board = await getById(boardId)
  if (!board.msgs) board.msgs = []

  const msg = {
    id: utilService.makeId(),
    by: userService.getLoggedinUser(),
    txt,
  }
  board.msgs.push(msg)
  await storageService.put(STORAGE_KEY, board)

  return msg
}

function getEmptyBoard(title = '', imgUrl = '') {
  return {
    id: utilService.makeId(),
    title,
    imgUrl,
    bgColor: '',
    isStarred: false,
    archivedAt: Date.now,
    createdBy: {
      _id: 'u101',
      fullname: 'Abi Abambi',
      imgUrl: '',
    },
    style: {
      backgroundImage: '',
    },
    labels: _labelOptions(),
    members: _membersOptions(),
    cover: coverOptions(),
    backGround: backgroundOptions(),
    groups: [],
    activities: [],
  }
}
function getEmptyGroup(title) {
  return {
    id: utilService.makeId(),
    title,
    archivedAt: null,
    tasks: [],
    style: {},
  }
}

function getEmptyTask(title) {
  return {
    id: utilService.makeId(),
    title,
    status: '',
    description: '',
    comments: [],
    checklists: [],
    labelIds: [],
    labels: [],
    attachment: [],
    watching: false,
    createdAt: Date.now(),
    dueDate: '',
    byMember: {
      id: 'm102',
      username: 'Guest',
      fullname: '',
      imgUrl: '',
      createdAt: '2023-07-29',
    },
    members: [],
    style: {
      bgColor: '',
      bgImgUrl: '',
    },
  }
}

function getEmptyActivity(activity, task = {}, group = {}) {
  return {
    id: utilService.makeId(),
    txt: activity,
    createdAt: Date.now(),
    task: {
      id: task.id || '',
      title: task.title || '',
    },
    group: {
      id: group.id || '',
      title: group.title || '',
    },
    byMember: {
      _id: 'g100',
      fullname: 'Guest',
      imgUrl: '',
    },
  }
}

function coverOptions() {
  return {
    coverColors: [
      '#277da1',
      '#4d908e',
      '#fb6f92',
      '#90be6d',
      '#f9c74f',
      '#f9844a',
      '#00b4d8',
      '#3a5a40',
    ],
    coverImgs: [
      'https://webneel.com/daily/sites/default/files/images/daily/08-2018/1-nature-photography-spring-season-mumtazshamsee.jpg',
      'https://media.istockphoto.com/photos/the-sun-goes-down-behind-the-autumn-forest-picture-id1162998855?k=20&m=1162998855&s=612x612&w=0&h=JLbCH4hLaO5war1ipJXx7eoxXMdhcMXFO9pwXz1NR1Q=',
      'https://wallpaperaccess.com/full/1131217.jpg',
      'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/close-up-of-tulips-blooming-in-field-royalty-free-image-1584131603.jpg',
      'https://media.istockphoto.com/photos/hydrangea-flowers-in-the-garden-picture-id927499422?k=20&m=927499422&s=612x612&w=0&h=9fZtBAXZ3I8qNRTi87SHTDEjbBjyn_eRoDoLAC7zVvg=',
      'https://i.pinimg.com/originals/18/28/4e/18284ec99d85c9ee5afaf05baf77083a.jpg',
      'https://media.istockphoto.com/photos/colored-ceiling-picture-id1208301897?k=20&m=1208301897&s=612x612&w=0&h=xXFlsJphxez3hgCYRxYmS7yxb5P4-HOtbnsjIVJSSWA=',
      'https://assets.weforum.org/global_future_council/image/xALg-7b0WN5aLOY6aejbKW3NepG-PEipzKnEuyS8ZlI.jpeg',
      'https://media.cntraveler.com/photos/5ca60f7f7b531a5e47949cde/master/w_4000,h_2400,c_limit/NYC_GettyImages-500619014.jpg',
      'https://images.pexels.com/photos/460621/pexels-photo-460621.jpeg?auto=compress&cs=tinysrgb&w=1600',
    ],
  }
}

function _labelOptions() {
  return [
    {
      id: 'l101',
      color: '#f87562',
      title: 'Urgent',
    },
    {
      id: 'l102',
      color: '#2a9d8f',
      title: 'Important',
    },
    {
      id: 'l103',
      color: '#e9c46a',
      title: 'New',
    },
    {
      id: 'l104',
      color: '#48cae4',
      title: 'Nice to have',
    },
    {
      id: 'l106',
      color: '#adc178',
      title: 'Delayed',
    },
    {
      id: 'l107',
      color: '#9c89b8',
      title: 'In progress',
    },
    {
      id: 'l108',
      color: '#0ead69',
      title: 'Done',
    },
    {
      id: 'l109',
      color: '#16697a',
      title: 'Do not forget',
    },
    {
      id: 'l110',
      color: '#70e000',
      title: 'Bug',
    },
    {
      id: 'l111',
      color: '#00a8e8',
      title: 'Take care today',
    },
  ]
}

function _membersOptions() {
  return [
    {
      id: 'm101',
      username: 'guydahan41',
      fullname: 'Guy Dahan',
      imgUrl:
        'https://ca.slack-edge.com/T04U05NLZ2M-U05794DRP98-f7c5750aa2dd-192',
      backgroundColor: '#e63946',
    },
    {
      id: 'm102',
      username: 'shayzigdon1',
      fullname: 'Shay Zigdon',
      imgUrl:
        'https://ca.slack-edge.com/T04U05NLZ2M-U04UNLA704D-abc56285845d-72',
      backgroundColor: '#2a9d8f',
    },
    {
      id: 'm103',
      username: 'alonp11',
      fullname: 'Alon Perlin',
      imgUrl:
        'https://ca.slack-edge.com/T04U05NLZ2M-U053T2NRWQL-ec8cffe84642-192',
      backgroundColor: '#e9c46a',
    },
    {
      id: 'm104',
      username: 'dimapolo1',
      fullname: 'Dima Polo',
      imgUrl:
        'https://ca.slack-edge.com/T04U05NLZ2M-U056VBMJLKG-51a0b5aa8bbe-512',
      backgroundColor: '#48cae4',
    },
    {
      id: 'm105',
      username: 'adambercovich',
      fullname: 'Adam Bercovich',
      imgUrl:
        'https://ca.slack-edge.com/T04U05NLZ2M-U04UB8KDZH6-0fbe87aa89af-72',
      backgroundColor: '#adc178',
    },
    // {
    //   id: "m106",
    //   username: "guydahan41",
    //   fullname: "Guy Dahan",
    //   imgUrl: "https://ca.slack-edge.com/T04U05NLZ2M-U05794DRP98-f7c5750aa2dd-192",
    //   backgroundColor: "#e63946",
    //   bgColor: "#9c89b8",
    // },
    // {
    //   id: "m107",
    //   username: "guydahan41",
    //   fullname: "Guy Dahan",
    //   imgUrl: "https://ca.slack-edge.com/T04U05NLZ2M-U05794DRP98-f7c5750aa2dd-192",
    //   backgroundColor: "#e63946",
    //   bgColor: "#00a8e8",
    // },
    // {
    //   id: "m108",
    //   username: "guydahan41",
    //   fullname: "Guy Dahan",
    //   imgUrl: "https://ca.slack-edge.com/T04U05NLZ2M-U05794DRP98-f7c5750aa2dd-192",
    //   backgroundColor: "#e63946",
    //   bgColor: "#0ead69",
    // },
    // {
    //   id: "m109",
    //   username: "guydahan41",
    //   fullname: "Guy Dahan",
    //   imgUrl: "https://ca.slack-edge.com/T04U05NLZ2M-U05794DRP98-f7c5750aa2dd-192",
    //   backgroundColor: "#e63946",
    //   bgColor: "#16697a",
    // },
    // {
    //   id: "m110",
    //   username: "guydahan41",
    //   fullname: "Guy Dahan",
    //   imgUrl: "https://ca.slack-edge.com/T04U05NLZ2M-U05794DRP98-f7c5750aa2dd-192",
    //   backgroundColor: "#e63946",
    //   bgColor: "#70e000",
    // },
  ]
}
function backgroundOptions() {
  return {
    gradients: [
      {
        id: 'g101',
        color:
          'https://d2k1ftgv7pobq7.cloudfront.net/images/backgrounds/gradients/snow.svg',
        emoji: '❄️',
      },
      {
        id: 'g102',
        color:
          'https://d2k1ftgv7pobq7.cloudfront.net/images/backgrounds/gradients/ocean.svg',
        emoji: '🌊',
      },
      {
        id: 'g103',
        color:
          'https://d2k1ftgv7pobq7.cloudfront.net/images/backgrounds/gradients/crystal.svg',
        emoji: '🔮',
      },
      {
        id: 'g104',
        color:
          'https://d2k1ftgv7pobq7.cloudfront.net/images/backgrounds/gradients/rainbow.svg',
        emoji: '🌈',
      },
      {
        id: 'g106',
        color:
          'https://d2k1ftgv7pobq7.cloudfront.net/images/backgrounds/gradients/peach.svg',
        emoji: '🍑',
      },
      {
        id: 'g107',
        color:
          'https://d2k1ftgv7pobq7.cloudfront.net/images/backgrounds/gradients/flower.svg',
        emoji: '🌸',
      },
      {
        id: 'g108',
        color:
          'https://d2k1ftgv7pobq7.cloudfront.net/images/backgrounds/gradients/earth.svg',
        emoji: '🌍',
      },
      {
        id: 'g109',
        color:
          'https://d2k1ftgv7pobq7.cloudfront.net/images/backgrounds/gradients/alien.svg',
        emoji: '👽',
      },
      {
        id: 'g110',
        color:
          'https://d2k1ftgv7pobq7.cloudfront.net/images/backgrounds/gradients/volcano.svg',
        emoji: '🌋',
      },
    ],
    colors: [
      {
        id: 'c101',
        color: 'rgb(137, 96, 158)',
      },
      {
        id: 'c102',
        color: 'rgb(176, 70, 50)',
      },
      {
        id: 'c103',
        color: 'rgb(81, 152, 57)',
      },
      {
        id: 'c104',
        color: 'rgb(210, 144, 52)',
      },
      {
        id: 'c106',
        color: 'rgb(0, 121, 191)',
      },
      {
        id: 'c107',
        color: 'rgb(131, 140, 145)',
      },
      {
        id: 'c108',
        color: 'rgb(0, 174, 204)',
      },
      {
        id: 'c109',
        color: 'rgb(75, 191, 107)',
      },
      {
        id: 'c110',
        color: 'rgb(205, 90, 145)',
      },
    ],
  }
}
