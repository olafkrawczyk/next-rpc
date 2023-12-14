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

export default function Home() {
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [generatedCode, setGeneratedCode] = useState("");

  const { localStream, remoteStream, startCall } = useVideo();

  useEffect(() => {
    if (
      !localStream ||
      !remoteStream ||
      !localVideoRef.current ||
      !remoteVideoRef.current
    )
      return;

    localVideoRef.current.srcObject = localStream;
    remoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream, startCall, localVideoRef, remoteVideoRef]);

  return (
    <Stack direction="column" alignItems="center" justifyContent="center">
      <Heading>Video Chat</Heading>
      <HStack sx={{ w: "100%", p: 10 }}>
        <VStack sx={{ flex: 0.5 }}>
          <Heading>Local</Heading>
          <video autoPlay playsInline muted ref={localVideoRef} />
        </VStack>
        <VStack sx={{ flex: 0.5 }}>
          <Heading>Remote</Heading>
          <video autoPlay playsInline ref={remoteVideoRef} />
        </VStack>
      </HStack>
      <VStack
        sx={{ w: "50%", p: 10 }}
        alignItems="center"
        justifyContent="center"
      >
        <Input
          name="code"
          placeholder="Enter code"
          disabled
          value={generatedCode}
        />
        <Button
          onClick={async () => {
            const code = await startCall();
            setGeneratedCode(`${window.location.href}meeting/${code}`);
          }}
        >
          Start call
        </Button>
      </VStack>
    </Stack>
  );
}
