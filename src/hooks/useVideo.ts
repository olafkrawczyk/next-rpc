"use client";
import { useContext, useEffect, useState } from "react";

import {
  collection,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { FirebaseContext } from "@/context/firebaseContext";

const rtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export const useVideo = () => {
  const { firestore } = useContext(FirebaseContext);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
      },
      audio: false,
    });
    setLocalStream(stream);

    if (peerConnection) {
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });
    }
  };

  useEffect(() => {
    const pc = new RTCPeerConnection(rtcConfig);
    setPeerConnection(pc);
    setRemoteStream(new MediaStream());
  }, []);

  useEffect(() => {
    if (!peerConnection) return;
    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream?.addTrack(track);
      });
    };
    getLocalStream();
  }, [peerConnection, remoteStream]);

  const startCall = async () => {
    if (!firestore || !peerConnection) return;

    const callsRef = collection(firestore, "calls");
    const callDoc = doc(callsRef);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const anwserCandidates = collection(callDoc, "answerCandidates");

    peerConnection.onicecandidate = async (event) => {
      event.candidate &&
        (await setDoc(doc(offerCandidates), event.candidate.toJSON()));
    };

    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
    await setDoc(callDoc, { offer });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!peerConnection.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        peerConnection.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(anwserCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(candidate);
        }
      });
    });

    return callDoc.id;
  };

  const answerCall = async (callId: string) => {
    if (!firestore || !peerConnection) return;

    const callsRef = collection(firestore, "calls");
    const callDoc = doc(callsRef, callId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const anwserCandidates = collection(callDoc, "answerCandidates");

    peerConnection.onicecandidate = async (event) => {
      event.candidate &&
        (await setDoc(doc(anwserCandidates), event.candidate.toJSON()));
    };

    const callData = (await getDoc(callDoc)).data();
    const offerDescription = callData?.offer;
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDescription);

    const answer = {
      sdp: answerDescription.sdp,
      type: answerDescription.type,
    };

    await updateDoc(callDoc, { answer });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  return {
    localStream,
    remoteStream,
    startCall,
    answerCall,
  };
};
