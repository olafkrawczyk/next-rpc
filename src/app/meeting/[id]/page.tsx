"use client";

import { useVideo } from "@/hooks/useVideo";
import {
  Button,
  HStack,
  Heading,
  Input,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

export default function Meeting({ params }: { params: { id: string } }) {
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [code, setCode] = useState("");

  const { localStream, remoteStream, answerCall } = useVideo();

  useEffect(() => {
    localVideoRef.current!.srcObject = localStream;
    remoteVideoRef.current!.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  return (
    <Stack>
      <Heading>Video Chat</Heading>
      <HStack sx={{ w: "100%", p: 10 }}>
        <VStack sx={{ flex: 0.5 }}>
          <Heading>Remote</Heading>
          <video autoPlay playsInline ref={remoteVideoRef} />
        </VStack>
        <VStack sx={{ flex: 0.5 }}>
          <Heading>Local</Heading>
          <video autoPlay playsInline muted ref={localVideoRef} />
        </VStack>
      </HStack>
      <HStack
        sx={{ w: "100%", p: 10 }}
        alignItems="center"
        justifyContent="center"
      >
        <Button
          onClick={async () => {
            await answerCall(params.id);
          }}
        >
          Join
        </Button>
      </HStack>
    </Stack>
  );
}
